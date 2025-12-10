import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {useCart, useDispatchCart} from '../components/ContextReducer';
import './Cart.css';


export default function Cart() {
  let data = useCart();
  let dispatch = useDispatchCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  if (data.length === 0) {
    return (
    <div>
    <div className=' text-center text-white  fs-3'>The Cart is Empty!</div>
    </div>
)
 }
/* const handleRemove = (index)=>{
   console.log(index)
   dispatch({type:"REMOVE",index:index})
 }*/

 const handleCheckOut = async () => {
  try {
    setLoading(true);
    setMessage("");
    
    let userEmail = localStorage.getItem("userEmail");
    let userName = localStorage.getItem("userName");
    let authToken = localStorage.getItem("authToken");
    
    // Validate user is logged in
    if (!userEmail) {
      setMessage("❌ Please login first to checkout");
      setLoading(false);
      return;
    }
    
    if (!data || data.length === 0) {
      setMessage("❌ Cart is empty");
      setLoading(false);
      return;
    }

    const totalPrice = data.reduce((total, food) => total + food.price, 0);
    
    console.log("Proceeding to payment with:", {
      items: data.length,
      email: userEmail,
      total: totalPrice,
      date: new Date().toDateString()
    });

    // Navigate to payment/checkout page with cart data
    navigate('/payment', {
      state: {
        cartItems: data,
        userEmail: userEmail,
        userName: userName,
        totalAmount: totalPrice,
        orderDate: new Date().toDateString()
      }
    });
  } catch (error) {
    console.error("Checkout error:", error);
    setMessage(`❌ Error: ${error.message}`);
    setLoading(false);
  }
}

let totalPrice = data.reduce((total, food) => total + food.price, 0)
  return (
    <div>

     
      <div className='container m-auto mt-5 table-responsive  table-responsive-sm table-responsive-md' >
        <table className='table table-hover '>
          <thead className=' text-success fs-2'>
            <tr>
              <th scope='col' >#</th>
              <th scope='col' >Name</th>
              <th scope='col' >Quantity</th>
              <th scope='col' >Option</th>
              <th scope='col' >Amount</th>
              <th scope='col' ></th>
            </tr>
          </thead>
          <tbody className='tbody'>
            {data.map((food, index) => (
              <tr>
                <th scope='row text-white' >{index + 1}</th>
                <td >{food.name}</td>
                <td>{food.qty}</td>
                <td>{food.size}</td>
                <td>{food.price}</td>
                <td ><button type="button" className="btn p-0"><img src="trash.jpeg"   alt="delete" onClick={() => { dispatch({ type: "REMOVE", index: index }) }} /></button> 
                </td>
              </tr>
            ))}

            
          </tbody>
        </table>
        <div><h1 className='fs-2 text-success'>Total Price: {totalPrice}/-</h1></div>
        {message && (
          <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} mt-3`} role="alert">
            {message}
          </div>
        )}
        <div>
            <button 
              className='btn bg-success mt-5' 
              onClick={handleCheckOut}
              disabled={loading}
            >
              {loading ? "Processing..." : "Check Out"}
            </button>
        </div>
       
      </div>



    </div>
  )
}
