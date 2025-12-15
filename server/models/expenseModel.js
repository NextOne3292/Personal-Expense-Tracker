import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema ({
  title:{type:String,
    required:true,
    trim:true
  },
  amount:{
    type:Number,
    required:true,
    min:0.01

  },
  category:{type:mongoose.Schema.Types.ObjectId,
    ref:"Category",
    required:true

  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  date:{
    type:Date,
    default:Date.now
  },
  note:{
    type:String,
    default:""
  }

},
{timestamps:true});
const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;