const VendorItem = require('../models/VendorItem');
const Plan = require('../models/Plan');
const Review = require('../models/Review');

// Lấy danh sách VendorItems theo accId
const getVendorItemsByAccId = async (req, res) => {
    const { accId } = req.params;
    try {
        const vendoritems = await VendorItem.find({ accId });
        if (!vendoritems.length) {
            return res.status(404).json({ message: 'No VendorItems found for this account' });
        }
        res.json({ vendoritems });
    } catch (error) {
        console.error('Error fetching vendor items by accId:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Lấy thông tin VendorItem theo type
const getVendorItemByType = async (req,res)=>{
    const {type} = req.params
    try {
        const items  = await VendorItem.find({type:type})
        if (items.length===0) {
            return res.status(404).json({ message: 'VendorItem not found' });
        }
        res.json({ vendoritem:items })
    } catch (error) {
        console.error('Error fetching vendor item by id:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

// Lấy thông tin VendorItem theo id
const getVendorItemById = async (req, res) => {
    const { id } = req.params;
    try {
        const vendoritem = await VendorItem.findById(id);
        if (!vendoritem) {
            return res.status(404).json({ message: 'VendorItem not found' });
        }
        res.json({ vendoritem });
    } catch (error) {
        console.error('Error fetching vendor item by id:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Tạo mới VendorItem
const createVendorItem = async (req, res) => {
    const {accId, name, type,description,imgLink,typeVendor,priceSell,priceRent} = req.body;
    try {
        const existingVendorItem = await VendorItem.findOne({ name, accId });
        if (existingVendorItem) {
            return res.status(400).json({ message: 'VendorItem already exists!' });
        }

        const newVendorItem = new VendorItem({accId, name, type,description,imgLink,typeVendor,priceSell,priceRent});

        await newVendorItem.save();
        res.status(201).json({ vendoritem: newVendorItem });
    } catch (error) {
        console.error('Error creating vendor item:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}; 

const createManyVendorItems = async (req, res) => {
    const {vendorItems} = req.body;
    try {
        const result = await VendorItem.insertMany(vendorItems);
        res.status(201).json({ message: 'Vendor items added successfully', data: result });
     
        
    } catch (error) {
        console.error('Error creating vendor item:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};


// Cập nhật thông tin VendorItem theo id
const updateVendorItem = async (req, res) => {
    const { id } = req.params;
    const { accId, name, type,description,imgLink,typeVendor,priceSell,priceRent} = req.body;
    try {
        const updatedVendorItem = await VendorItem.findByIdAndUpdate(
            id,
            { accId, name, type,description,imgLink,typeVendor,priceSell,priceRent},
            { new: true }
        );

        if (!updatedVendorItem) {
            return res.status(404).json({ message: 'VendorItem not found' });
        }

        res.json({ updatedVendorItem });
    } catch (error) {
        console.error('Error updating vendor item:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Xóa VendorItem theo id
const deleteVendorItem = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedVendorItem = await VendorItem.findByIdAndDelete(id);

        if (!deletedVendorItem) {
            return res.status(404).json({ message: 'VendorItem not found' });
        }

        res.json({ message: 'VendorItem successfully deleted', deletedVendorItem });
    } catch (error) {
        console.error('Error deleting vendor item:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const deleteVendorItemByType = async (req, res) => {
    const { type } = req.params;
    try {
        const deletedVendorItems = await VendorItem.deleteMany({type:type});

        if (deletedVendorItems.deletedCount ===0) {
            return res.status(404).json({ message: 'VendorItem not found' });
        }

        res.json({ message: 'VendorItem successfully deleted' });
    } catch (error) {
        console.error('Error deleting vendor item:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};


const getVendorItemByPlanGroupByType=async (req,res)=>{
    const {accId}  =req.params
    try {
        const plan = await  Plan.findOne({accId})
        if(!plan ) return res.status(404).json({message:"plan not found"})
        
        const vendorPromises = plan.vendors.map(e=>VendorItem.findById(e.vendorId))
        const vendorsData  = await Promise.all(vendorPromises)
        
        const groupedVendors = vendorsData.reduce((result,vendor)=>{
            if(vendor){
                const {type } = vendor 
                if(!result[type]){
                    result[type]={}
                }
                result[type]=vendor
            }
            return result
        },{})
        return res.status(200).json(groupedVendors)


    } catch (error) {
        
    }

}
const updateFieldInAllItems = async (req, res) => {
    const { field, newValue } = req.body;  // field là tên trường cần sửa, newValue là giá trị mới

    try {
        // Kiểm tra xem trường 'field' và 'newValue' có tồn tại trong request body hay không
        if (!field || !newValue) {
            return res.status(400).json({ message: "Field or newValue is missing" });
        }

        // Tạo đối tượng để cập nhật giá trị trường
        const updateData = {};
        updateData[field] = newValue;

        // Cập nhật tất cả các bản ghi trong VendorItem
        const result = await VendorItem.updateMany({}, { $set: updateData });

        if (result.nModified === 0) {
            return res.status(404).json({ message: 'No documents were updated' });
        }

        res.json({ message: 'Documents updated successfully', result });
    } catch (error) {
        console.error('Error updating documents:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}
module.exports = {
    getVendorItemsByAccId,
    getVendorItemById,
    getVendorItemByType,
    createVendorItem, 
    updateVendorItem, 
    deleteVendorItem, 
    createManyVendorItems, 
    getVendorItemByPlanGroupByType, 
    deleteVendorItemByType, 
    updateFieldInAllItems 
};
