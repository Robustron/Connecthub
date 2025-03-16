const Message = require('../models/Message');

const { messageSchema } = require('../utils/validationSchemas');

exports.sendMessage = async (req, res) => {
  try {
    const { error } = messageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Validation error', error: error.details[0].message });
    }

    const { receiverId, content } = req.body;
    const sender = req.user._id;

    const message = new Message({
      sender,
      receiver: receiverId,
      content,
    });

    await message.save();

    // Emit the message to the receiver using Socket.IO
    req.io.to(receiverId.toString()).emit('newMessage', message);

    res.status(201).json({ message: 'Message sent successfully', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUser, receiver: userId },
        { sender: userId, receiver: currentUser },
      ],
    }).sort('createdAt');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversation', error: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const currentUser = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: currentUser }, { receiver: currentUser }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUser] },
              '$receiver',
              '$sender',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          user: { _id: 1, username: 1, profilePicture: 1 },
        },
      },
    ]);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
};