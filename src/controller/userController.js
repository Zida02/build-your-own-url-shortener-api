const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
  } catch (error) {}
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
