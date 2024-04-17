'use server'

import { revalidatePath } from "next/cache";
import { ConnectToDB } from "../mongoose";
import User from "../models/user.model";
import Thread from "../models/thread.model";
import { error } from "console";
import Community from "../models/community.model";


interface Params{
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}
export async function createThread({
text,author,communityId,path
}: Params) {
    try {
        ConnectToDB();
        const communityIdObject = await Community.findOne(
            { id: communityId },
            { _id: 1 }
          );      
        const createThread = await Thread.create({
            text,
            author,
            commmunity: communityId,
        }); //This produces the Thread
    
        //Update User Model
        if (communityIdObject){
        await Community.findByIdAndUpdate(communityIdObject, {
            $push: { threads: createThread._id} //This pushed the thread to User
        })
        }
        revalidatePath(path);
    } catch (error:any) {
        throw new Error(`Error Creating Thread: ${error.message}`);
    }
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
    const childThreads = await Thread.find({ parentId: threadId });
  
    const descendantThreads = [];
    for (const childThread of childThreads) {
      const descendants = await fetchAllChildThreads(childThread._id);
      descendantThreads.push(childThread, ...descendants);
    }
  
    return descendantThreads;
  }

// The pageNumber variable is the current page number, and the pageSize variable is the number of documents to display on each page

export async function fetchPost(pageNumber=1, pageSize=20){
    ConnectToDB();
    const skipAmount = (pageNumber - 1) * pageSize; 
    //This snnipet fetched the post that have no parent id
    // The postQuery variable you provided is a MongoDB query that will find all threads with no parent (parentId: {$in: [null, undefined]}), sorted by createdAt in descending order (sort: { createdAt: 'desc' })
    const postsQuery = Thread.find({ parentId: {$in: [null, undefined]}})
    .sort({ createdAt: 'desc'})
    .skip(skipAmount) //This can be useful for implementing pagination
    .limit(pageSize)  //The .limit() method in MongoDB allows you to limit the number of documents that are returned by a query
    .populate({ path: 'author',model: User}) //The .populate() method in MongoDB allows you to populate the fields of a document with the data from other documents in other collections
    .populate({ path: "community", model: Community})
    .populate({
        path: 'children',
        populate: {
            path: 'author',
            model: User,
            select: "_id name parentId image"
        }
    })
    const totalPostCount = await Thread.countDocuments({
        parentId : {$in : [null, undefined]},
    })
    const posts = await postsQuery.exec(); //is used to execute the postsQuery query and assign the results to the posts variable
    const isNext = totalPostCount > skipAmount + posts.length
    return { posts, isNext}
}

export async function fetchThreadById(id: string){
    ConnectToDB();


    // TODO: Populate Community
    try {
        const thread = await Thread.findById(id)
        .populate({
            path: 'author',
            model: User,
            select: "_id id name image"
        })
        .populate({
            path: 'children',
            populate: [
                {
                    path: 'author',
                    model: User,
                    select: "_id id name parentId image"
                },
                {
                    path: 'children',
                    model: Thread,
                    populate: {
                        path: 'author',
                        model: User,
                        select: "_id id name parentId image  "
                    }
                }
            ]
        }).exec();

        return thread;
    } catch (error: any) {
        throw new Error(`Error fetching thread: ${error.message}`)
    }
}

export async function addCommentToThread(threadId:string, threadText: string, userId: string, path:string) {
    ConnectToDB()
    try{
        const origThread = await Thread.findById(threadId);
    if(!origThread){
        throw new Error(`Error fetching original thread: ${error}`);
    }
    if (typeof userId === 'string' && userId.startsWith('"') && userId.endsWith('"')) {
        userId = userId.replace(/"/g, ''); // Remove the extra quotes
    }
    // console.log(userId)

    if (typeof userId === 'string'){
        userId = userId.replace(/\\/g, '') // Remove the extra backslashes
    }

    const Comment = new Thread({
        text: threadText,
        author: userId,
        parentId: threadId,
    })


    const saveComment = await Comment.save(); //save the comment to the DB
    origThread.children.push(saveComment._id); //add the comment thread ID to the original threads's children array
    await origThread.save(); // save the updated original thread to the DB
    revalidatePath(path);
    }catch(error){
        throw new Error(`Comment jaa nahi raha hai(unable to add Comment) ${error}`)
    }
}