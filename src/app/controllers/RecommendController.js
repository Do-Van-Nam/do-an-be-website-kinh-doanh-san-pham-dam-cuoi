const axios = require('axios');
const VendorItem = require('../models/VendorItem'); // Điều chỉnh path cho đúng

// Danh sách thứ tự ưu tiên types (extract từ object type)
const orderedTypes = [
  "venue", "bridal-gown", "catering", "flowers", "makeup-services", "a-line-dress", "photographer",
  "wedding-planner", "wedding-cake", "dj", "videographer", "rental-bridal", "band", "bar-service",
  "transportation", "invitations", "ball-gown", "mermaid-dress", "bodycon-dress", "short-dress",
  "suit-and-tuxedo", "bridesmaid-dress", "wedding-ring", "princess-cut-ring", "asscher-cut-ring",
  "cushion-cut-ring", "emerald-cut-ring", "pear-cut-ring", "radiant-cut-ring", "round-cut-ring",
  "oval-cut-ring"
];

const getNlpData = async (req, res) => {
    try {
        const { userPrompt } = req.body;

        if (!userPrompt || userPrompt.trim() === '') {
            return res.status(400).json({ message: 'userPrompt là bắt buộc' });
        }

        // Gọi service Python để parse prompt
        const parseResponse = await axios.post('https://nlp-api-service2.onrender.com/parse', {
            prompt: userPrompt
        });

        const parsedData = parseResponse.data;

        // Kiểm tra cấu trúc response từ Python
        if (!parsedData || typeof parsedData !== 'object') {
            return res.status(500).json({ message: 'Dữ liệu từ service parse không hợp lệ' });
        }

        const { budget = 0, style = [], items: requiredItems = [] } = parsedData;

        // Chuẩn hóa style và requiredItems (lowercase để match case-insensitive)
        const normalizedStyles = style.map(s => s.trim().toLowerCase());
        const normalizedRequired = requiredItems.map(item => item.trim().toLowerCase());

        // Query tất cả vendorItems phù hợp với style (tags chứa ít nhất 1 style)
        let baseQuery = {};
        if (normalizedStyles.length > 0) {
            baseQuery.tags = { $in: normalizedStyles.map(s => new RegExp(s, 'i')) };
        }

        const allVendorItems = await VendorItem.find(baseQuery)
            .select({
                accId: 1, name: 1, type: 1, description: 1, rate: 1, noReview: 1, imgLink: 1,
                typeVendor: 1, priceSell: 1, priceRent: 1, periodRent: 1, tags: 1
            })
            .sort({ rate: -1, noReview: -1, priceSell: 1, priceRent: 1 }) // Ưu tiên rate cao, review nhiều, giá rẻ
            .lean();

        if (allVendorItems.length === 0) {
            return res.status(200).json({
                message: 'Không tìm thấy dịch vụ phù hợp với style',
                parsed: parsedData,
                required: [],
                suggested: [],
                totalCost: 0,
                remainingBudget: budget
            });
        }

        // Hàm lấy giá của item (ưu tiên priceSell nếu có, else priceRent)
        const getItemPrice = (item) => {
            if (item.typeVendor === 'sell' || item.typeVendor === 'both') {
                return item.priceSell > 0 ? item.priceSell : item.priceRent;
            }
            return item.priceRent > 0 ? item.priceRent : 0;
        };

        // Group allVendorItems by type (lowercase type để match)
        const itemsByType = {};
        allVendorItems.forEach(item => {
            const itemType = item.type ? item.type.trim().toLowerCase() : null;
            if (itemType) {
                if (!itemsByType[itemType]) {
                    itemsByType[itemType] = [];
                }
                itemsByType[itemType].push({ ...item, price: getItemPrice(item) });
            }
        });

        // Xác định required types: Các type match với requiredItems (qua type hoặc tags)
        const requiredTypes = new Set();
        const requiredSelected = [];
        let totalCost = 0;

        normalizedRequired.forEach(reqItem => {
            for (const [typeKey, itemList] of Object.entries(itemsByType)) {
                if (typeKey.includes(reqItem) || itemList.some(item => item.tags.some(tag => tag.toLowerCase().includes(reqItem)))) {
                    if (!requiredTypes.has(typeKey)) {
                        // Chọn 1 item tốt nhất (đầu tiên sau sort)
                        const bestItem = itemList[0];
                        if (bestItem && bestItem.price <= budget - totalCost) {
                            requiredSelected.push(bestItem);
                            totalCost += bestItem.price;
                            requiredTypes.add(typeKey);
                        }
                    }
                }
            }
        });

        // Budget còn lại
        let remainingBudget = budget - totalCost;

        // Gợi ý thêm theo thứ tự orderedTypes, skip requiredTypes, mỗi type chọn 1 item nếu đủ budget
        const suggested = [];
        orderedTypes.forEach(type => {
            const normalizedType = type.toLowerCase();
            if (!requiredTypes.has(normalizedType) && itemsByType[normalizedType]) {
                // Chọn item tốt nhất (đầu tiên sau sort)
                const bestItem = itemsByType[normalizedType][0];
                if (bestItem && bestItem.price <= remainingBudget) {
                    suggested.push(bestItem);
                    totalCost += bestItem.price;
                    remainingBudget -= bestItem.price;
                    requiredTypes.add(normalizedType); // Để tránh duplicate
                }
            }
        });

        // Trả về kết quả
        return res.status(200).json({
            parsed: parsedData,
            required: requiredSelected,
            suggested: suggested,
            totalCost: totalCost,
            remainingBudget: remainingBudget
        });

    } catch (error) {
        console.error("Lỗi trong getNlpData:", error.message);

        // Phân loại lỗi
        if (error.code === 'ECONNREFUSED') {
            return res.status(502).json({ message: 'Không thể kết nối đến service phân tích ngôn ngữ (Python)' });
        }

        if (error.response) {
            return res.status(502).json({ message: 'Lỗi từ service NLP', details: error.response.data || error.message });
        }

        return res.status(500).json({ message: 'Lỗi server nội bộ', error: error.message });
    }
};


// const OPTIMIZE_API_URL = 'http://localhost:8001/optimize'; // URL của file optimize.py
const OPTIMIZE_API_URL = 'https://nlp-api2.onrender.com/optimize'; // URL của file optimize.py

const getNlpData2 = async (req, res) => {
    try {
        const { userPrompt } = req.body;
        if (!userPrompt) return res.status(400).json({ message: 'userPrompt là bắt buộc' });

        // 1. Parse NLP để lấy budget, style, items
        const parseResponse = await axios.post('https://nlp-api-service2.onrender.com/parse', {
            prompt: userPrompt
        });
        const { budget = 0, style = [], items: requiredItems = [] } = parseResponse.data;
console.log(parseResponse.data);
        // 2. Query Database lấy danh sách ứng viên (Candidate Items)
        const normalizedStyles = style.map(s => s.trim().toLowerCase());
        let baseQuery = {};
        if (normalizedStyles.length > 0) {
            // baseQuery.tags = { $in: normalizedStyles.map(s => new RegExp(s, 'i')) };
            baseQuery.tags = { $in: normalizedStyles };
        }

        const allVendorItems = await VendorItem.find(baseQuery).lean();

        // 3. Chuẩn bị dữ liệu cho Python Optimize
        const itemsForOptimize = allVendorItems.map(item => {
            const price = (item.typeVendor === 'sell' || item.typeVendor === 'both') 
                          ? (item.priceSell || item.priceRent) 
                          : item.priceRent;
            
            return {
                id: item._id.toString(),
                type: item.type ? item.type.toLowerCase() : 'unknown',
                price: price || 0,
                // Tính toán giá trị dựa trên rate và noReview
                value: (item.rate || 0) * (item.noReview || 1) 
            };
        });

        // Xác định danh sách các type mà user yêu cầu cụ thể
        const requiredTypes = requiredItems.map(item => item.toLowerCase());

        // 4. Gọi Python API để giải bài toán tối ưu
        const optimizeResponse = await axios.post(OPTIMIZE_API_URL, {
            budget: budget,
            required_types: requiredTypes,
            items: itemsForOptimize
        });

        const result = optimizeResponse.data;

        // 5. Map ngược lại dữ liệu đầy đủ từ DB để trả về cho Client
        const finalSelected = result.selected.map(sel => {
            const fullDetail = allVendorItems.find(i => i._id.toString() === sel.id);
            return { ...fullDetail, price: sel.price, value: sel.value };
        });

        return res.status(200).json({
            parsed: parseResponse.data,
            suggested: finalSelected,
            
                totalCost: result.total_cost,
                totalValue: result.total_value,
                remainingBudget: result.remaining_budget,
                status: result.status,
                
             
                
        });

    } catch (error) {
        console.error("Lỗi:", error.message);
        return res.status(500).json({ message: 'Lỗi xử lý hệ thống', error: error.message });
    }
};
module.exports = { getNlpData, getNlpData2 };