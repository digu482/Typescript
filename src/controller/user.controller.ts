import {Request,Response} from "express";
import User, { IUser } from '../model/user';
import { passwordencrypt, passwordvalidation } from '../services/commonservices';
import { generateJwt } from '../utils/jwt';
const bcrypt = require("bcrypt")
interface CustomRequest extends Request {
  currentUser?: string; 
}


export const createuser = async (req: Request, res: Response) => {
    try {
      const { Name, email, mobile, password } = req.body;
  
      const existuser = await User.findOne({ $or: [{ email }, { mobile }] });
  
      if (existuser) {
        return res.status(400).json({
          status: 400,
          message: 'User already exists',
        });
      }
  
      if (!passwordvalidation(password)) {
        return res.status(400).json({
          status: 400,
          message: 'Password format is wrong',
        });
      }
  
      const hashedPassword = await passwordencrypt(password);
  
      const user: IUser = new User({
        Name,
        email: email.toLowerCase(),
        mobile,
        password: hashedPassword,
      });
  
      await user.save();
  
      return res.status(201).json({
        status: 201,
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: 'Internal Server Error',
      });
    }
};



export const UserLogin = async (req: Request, res: Response) => {
    try {
      const { email, mobile, password } = req.body;
      const userLogin = await User.findOne({
        $or: [
          { email },
          { mobile },
        ],
      });
  
      if (!userLogin) {
        return res.status(404).json({
          status: 404,
          error: true,
          message:"User not found",
        });
      } else {
        if (userLogin.isdelete) {
          return res.status(400).json({
            status: 400,
            error: true,
            message:"Your account is not active",
          });
        } else {
          const isvalid = await bcrypt.compare(password, userLogin.password);
  
          if (!isvalid) {
            return res.status(400).json({
              status: 400,
              error: true,
              message:"Details not match",
            });
          } else {
            const { error, token } = await generateJwt(userLogin._id);
  
            if (error) {
              return res.status(400).json({
                status: 400,
                error: true,
                message:"Not create token. Please try again later",
              });
            } else {
              await User.findOneAndUpdate({ _id: userLogin._id }, { $set: { token } }, { useFindAndModify: false });
  
              return res.status(200).json({
                status: 200,
                success: true,
                token,
                userLogin: email,
                message:"User logged in successfully",
              });
            }
          }
        }
      }
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message:"Server error"
      });
    }
};



export const logout = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.currentUser;
    await User.findById(userId);

    await User.findByIdAndUpdate(userId, { $set: { token: '' } }, { useFindAndModify: false });

    return res.status(200).json({
      status: 200,
      Msg: "User logout successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};
  


export const userfind = async (req: CustomRequest, res: Response) => {
  try {
    let userdata = await User.findById({ _id: req.currentUser });
    if (!userdata) {
      return res.status(404).json({
        status:404,
        error: true,
        message:"User not found",
      });
    }else{
      res.status(201).json({
        status:201,
        userdata,
        message:"Welcome your account",
      });
    }
  } catch (error) {
    console.log(error);
  }
};



export const updateuser = async (req: CustomRequest, res: Response) => {
  try {
    const { Name, email, mobile } = req.body;
    const userId = req.currentUser;

    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    } else {
      const existEmail = await User.findOne({ email, _id: { $ne: user._id } });
  
        if (existEmail) {
          return res.status(400).json({
            status: 400,
            message: "email is all ready exist",
          });
        } else {
        let updatedUser = {
          Name,
          email,
          mobile,
        };

        await User.findByIdAndUpdate(userId, updatedUser, { useFindAndModify: false });

        return res.status(200).json({
          status: 200,
          message:"User update successfuly",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message:"Server error",
    });
  }
};



export const userdelete = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.currentUser;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message:"User not found",
      });
    } else {
    await User.findByIdAndUpdate(userId, { $set: { isdelete: true } }, { useFindAndModify: false });
    return res.status(200).json({
      status: 200,
      Msg:"User delete successfuly",
    });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message:"Server error",
    });
  }
};



export const changepassword = async (req: Request, res: Response) => {
  const { email, currentPassword, newPassword, confirmPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    } else {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          status: 400,
          message: "User password and current password not match",
        });
      } else {
        if (!passwordvalidation(newPassword)) {
          return res.status(400).json({
            status: 400,
            message: "Password format is wrong",
          });
        }
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
          return res.status(400).json({
            status: 400,
            message: "New password and current password is same",
          });
        } else {
          if (newPassword !== confirmPassword) {
            return res.status(400).json({
              status: 400,
              Msg: "New password and conform password not match",
            });
          } else {
            const hashedPassword = await passwordencrypt(newPassword);
            await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
            return res.status(200).json({
              status: 200,
              Msg: "Password change successfully",
            });
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};



export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { searchDetails } = req.query;

    if (!searchDetails) {
      return res.status(400).json({
        status: 400,
        message: 'Details not match',
      });
    }

    // Perform a case-insensitive search on user names or emails
    const results = await User.find({
      $or: [
        { Name: { $regex: new RegExp(searchDetails.toString(), 'i') } },
        { email: { $regex: new RegExp(searchDetails.toString(), 'i') } },
      ],
    });

    return res.json({ results });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
  }
};