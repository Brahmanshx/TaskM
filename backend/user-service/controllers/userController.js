const { User } = require('../models');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.headers['x-user-id']; // Set by API Gateway after JWT verification
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.headers['x-user-id']; // Set by API Gateway after JWT verification
    const { 
        firstName, lastName, phone, bio, location,
        jobTitle, department, organization 
    } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
        firstName, lastName, phone, bio, location,
        jobTitle, department, organization
    });

    res.json({ 
        message: 'Profile updated successfully', 
        user: { 
            id: user.id, 
            username: user.username, 
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            // ... return other fields if needed for frontend state update immediately, 
            // but usually fetching profile again is safer or just these basic ones.
        } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
