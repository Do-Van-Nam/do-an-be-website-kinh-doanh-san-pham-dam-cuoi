const ChatRoom = require('../models/ChatRoom')
const Account = require('../models/Account')


const getChatRoomByAccId = async (req, res) => {
    const { accId } = req.params;
    //console.log(accId)
    try {
        // Tìm tất cả chatroom mà accId tham gia
        const chatrooms = await ChatRoom.find({
            $or: [{ user1Id: accId }, { user2Id: accId }]
        });

        if (!chatrooms || chatrooms.length === 0) {
            return res.status(200).json({ users: [] });
        }

        // Lấy ra userId của người còn lại trong mỗi room
        const otherUsers = chatrooms.map(chatroom => {
            const otherUserId = chatroom.user1Id.toString() === accId 
                ? chatroom.user2Id 
                : chatroom.user1Id;

            return {
                userId: otherUserId,
                chatRoomId: chatroom._id
            };
        });

        // Tìm thông tin các user kia (có thể null nếu user bị xóa)
        const userPromises = otherUsers.map(item => Account.findById(item.userId));
        const rawUserData = await Promise.all(userPromises);

        // Lọc và xử lý chỉ những user tồn tại
        const userData = rawUserData
            .map((user, index) => {
                if (!user) {
                    // Optional: log để debug sau này
                    console.log(`User not found: ${otherUsers[index].userId}`);
                    return null; // hoặc bỏ qua
                }

                const userObj = user.toObject(); // giờ user chắc chắn không null
                userObj.chatRoomId = otherUsers[index].chatRoomId;
                return userObj;
            })
            .filter(Boolean); // loại bỏ các null

        return res.status(200).json({ users: userData });

    } catch (error) {
        console.error('Error in getChatRoomByAccId:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Lấy thông tin ChatRoom theo id
const getChatRoomById = async (req, res) => {
    const { id } = req.params;
    try {
        const chatroom = await ChatRoom.findById(id);
        if (!chatroom) {
            return res.status(404).json({ message: 'ChatRoom not found' });
        }
        res.json({ chatroom });
    } catch (error) {
        console.error('Error fetching vendor item by id:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Tạo mới ChatRoom
const createChatRoom = async (req, res) => {
    const { user1Id, user2Id } = req.body;
    try {
        const existingChatRoom = await ChatRoom.findOne({ user1Id, user2Id });
        if (existingChatRoom) {
            console.log(existingChatRoom)
            return res.status(400).json({ message: 'ChatRoom already exists!' });
        }

        const newChatRoom = new ChatRoom({ user1Id, user2Id });

        await newChatRoom.save();
        res.status(201).json({ chatroom: newChatRoom });
    } catch (error) {
        console.error('Error creating vendor item:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Cập nhật thông tin ChatRoom theo id
const updateChatRoom = async (req, res) => {
    const { id } = req.params;
    const { user1Id, user2Id } = req.body;
    try {
        const updatedChatRoom = await ChatRoom.findByIdAndUpdate(
            id,
            { user1Id, user2Id },
            { new: true }
        );

        if (!updatedChatRoom) {
            return res.status(404).json({ message: 'ChatRoom not found' });
        }

        res.json({ updatedChatRoom });
    } catch (error) {
        console.error('Error updating vendor item:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Xóa ChatRoom theo id
const deleteChatRoom = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedChatRoom = await ChatRoom.findByIdAndDelete(id);

        if (!deletedChatRoom) {
            return res.status(404).json({ message: 'ChatRoom not found' });
        }

        res.json({ message: 'ChatRoom successfully deleted', deletedChatRoom });
    } catch (error) {
        console.error('Error deleting vendor item:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getChatRoomByAccId,
    getChatRoomById,
    createChatRoom,
    updateChatRoom,
    deleteChatRoom
};
