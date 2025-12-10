import React, { useState } from 'react'
import {useCart, useDispatchCart} from '../components/ContextReducer';
import './Cart.css';


export default function Cart() {
  let data = useCart();
  let dispatch = useDispatchCart();
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

    console.log("Checkout Data:", {
      items: data.length,
      email: userEmail,
      total: data.reduce((total, food) => total + food.price, 0),
      date: new Date().toDateString()
    });

    let response = await fetch("http://localhost:5000/api/orderData", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      },
      body: JSON.stringify({
        order_data: data,
        email: userEmail,
        order_date: new Date().toDateString()
      })
    });

    console.log("Response Status:", response.status);
    const responseData = await response.json();
    console.log("Response Data:", responseData);

    if (response.status === 200 || response.status === 201) {
      if (responseData.success) {
        setMessage("✅ Order placed successfully!");
        setTimeout(() => {
          dispatch({ type: "DROP" });
          setMessage("");
        }, 1500);
      } else {
        setMessage(`❌ ${responseData.message || "Failed to place order"}`);
      }
    } else {
      setMessage(`❌ Error: ${responseData.message || "Checkout failed"}`);
    }
  } catch (error) {
    console.error("Checkout error:", error);
    setMessage(`❌ Error: ${error.message}`);
  } finally {
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
