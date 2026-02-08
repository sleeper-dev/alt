import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

messageSchema.virtual("senderUsername").get(function () {
  return this.sender?.username || "Unknown";
});

export const Message = mongoose.model("Message", messageSchema);
