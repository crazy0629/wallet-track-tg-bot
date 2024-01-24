import UserInfo from "../models/user";

export const getAllUserIdLists = async () => {
  try {
    const models = await UserInfo.find();
    return models;
  } catch (error) {
    console.log(error);
  }
};

export const saveUserId = async (chatId: number) => {
  try {
    const model = await UserInfo.findOne({ userId: chatId });
    if (model !== null) {
      const result = {
        success: false,
        message:
          "User was already subscribed to Me! I will send you new update!",
      };
      return result;
    }
    const newUser = new UserInfo();
    newUser.userId = chatId;
    await newUser.save();
    const result = {
      success: true,
      message:
        "Thank you for your interest!, User is successfully subscribed to Me!",
    };
    return result;
  } catch (error) {
    const result = {
      success: false,
      message: "Oops! Error occured! Please try again!",
    };
    return result;
  }
};

export const removeUserId = async (chatId: number) => {
  try {
    const model = await UserInfo.findOne({ userId: chatId });
    if (model == null) {
      const result = {
        success: false,
        message: "You had not subscribed to me! Thank you!",
      };
      return result;
    }
    const deletedModel = await UserInfo.deleteOne({ userId: chatId });
    const result = {
      success: true,
      message: "Okay, no worries. We will stop sending you notification",
    };
    return result;
  } catch (error) {
    const result = {
      success: false,
      message: "Oops! Error occured! Please try again!",
    };
    return result;
  }
};
