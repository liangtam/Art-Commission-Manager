import { useEffect, useState, useContext } from "react";
import OrderSnippet from '../components/order_components/OrderSnippet';
import { OrdersContext } from "../context/OrdersContext";

const Orders = () => {
    const {orders, setOrders} = useContext(OrdersContext);
    // [] makes it only fire once
    const fetchOrders = async () => {
        const response = await fetch('/api/orders');
        // to parse the json from the above response into smt we can work w/ 
        const json = await response.json();

        if (response.ok) {
            setOrders(json);
            console.log('Fetched all forms in orders page! ', json);
        }
    }

    const handleOrderDelete = async (e, orderId) => {
        e.preventDefault();
        const response = await fetch('http://localhost:4000/api/orders/' + orderId, {
            method: 'DELETE',
        })

        if (response.ok) {
            console.log("Order deleted!");
            fetchOrders();
        }
        
    }

    // the empty array is dependency array. when it's empty, it means this only fires once
    useEffect(() => {
        fetchOrders();
    }, [])

    return (
        <div className="orders">
            {orders && orders.map((order) => {
                return <OrderSnippet key={order._id} orderId={order._id} order={order} handleOrderDelete={handleOrderDelete}/>  
            }
            )}
         </div>
    )
};

export default Orders;