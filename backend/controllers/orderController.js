const express = require('express');
const Order = require('../models/clientOrderModel');
const mongoose = require('mongoose');

//redirect to orders page
const redirectToOrders = (req, res) => {
    res.redirect('/orders');
}

// get orders
const getOrders = async (req, res) => {
    const orders = await Order.find({}).sort({createdAt: -1});
    res.status(200).json(orders);
}

// get a single order
const getOrder = async(req, res) => {
    const { id } = req.params;

    // to see if the ID is valid (eg. it has to be 12 digits)
    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Order does not exist.'});
    }
    const order = await Order.findById(id);

    if (!order) {
        return res.status(400).json({error: 'Order does not exist.'});
    }

    res.status(200).json(order);
}
// add a new order
const createOrder = async (req, res) => {
    const { clientName, clientContact, requestDetail, requestSnippet, orderFormFillouts, price, dateReqqed, datePaid, deadline, status } = req.body;
    
        try {
            const order = await Order.create({ clientName, clientContact, requestDetail, requestSnippet, orderFormFillouts, price, dateReqqed, datePaid, deadline, status });
            res.status(200).json(order);
        } catch (error) {
            res.status(400).json({error: error.message});
        }
};


// delete an order
const deleteOrder = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)){
        return res.status(404).json({error: 'Cannot delete order.'});
    }

    const order = await Order.findOneAndDelete({_id: id})

    if (!order){
        return res.status(404).json({error: 'Cannot delete order.'});
    }

    res.status(200).json(order);
}
// update an order
const updateOrder = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No such order.'});
    };

    const order = await Order.findOneAndUpdate({_id: id}, {
        ...req.body //spreading the property of the req.body object
    } );

    if (!order){
        return res.status(404).json({error: 'No such order.'});
    }

    res.status(200).json(order);
}
module.exports = { createOrder, getOrders, getOrder, deleteOrder, updateOrder };