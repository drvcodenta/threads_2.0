import mongoose from "mongoose";

const CommunitySchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        unique: true,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: String,
    bio: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    threads: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Threads"
    }],
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
});

const Community = mongoose.models.Community || mongoose.model("Community", CommunitySchema);

export default Community;