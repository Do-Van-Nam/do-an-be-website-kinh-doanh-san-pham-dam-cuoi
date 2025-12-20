const axios = require('axios');

const getNlpData = async (req, res) => {
    try {
        const { userPrompt } = req.params

        const response = await axios.post('http://localhost:8000/parse', {
            prompt: userPrompt
        });
        return res.status(200).json( {response} )
        console.log("Dữ liệu nhận được:", response.data);
    } catch (error) {
        console.error("Lỗi kết nối Python:", error.message);
        return res.status(500).json({ message: 'Server error' })
    }
}

//getNlpData("Tôi muốn đám cưới 200 triệu phong cách hiện đại");
module.exports = {
getNlpData
};