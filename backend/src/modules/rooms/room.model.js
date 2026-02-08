import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 30,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },

    password: {
      type: String,
      select: false,
      default: null,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bannedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

roomSchema.index({ name: 1 }, { unique: true });

roomSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const Room = mongoose.model("Room", roomSchema);
