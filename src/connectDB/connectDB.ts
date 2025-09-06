import mongoose from "mongoose";

const connectDB = async(mongo_url: string) => {
    try{
        await mongoose.connect(mongo_url as string);
        console.log("Conntected to DataBase");
    }
    catch(e){
        console.log('error while connecting to DB', e)
    }
}

export default connectDB;
