const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { postOrder, getOrders, getOrder, deleteOrder, updateOrder } = require('../controllers/orderController');

// storage object (disk storage)
// we first store the image on our computer, then to mongo
const Storage = multer.diskStorage({
    destination:(req, file, cb) => {
        // first arg: error, second: destination
        cb(null, './images');
    },
    filename: (req, file, cb) => {
        //console.log(file)
        // first arg: error, second: name of file. we added date to differentiate b/w files with same names
        cb(null, Date.now() + path.extname(file.originalname))
    }
})


// middleware containing the multer object, which contains two objects--storage
//  storage is kinda where the specifications of the files are
const upload = multer({
    storage: Storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/jpeg"
        ) {
            cb(null, true);
        } else {
            console.log("Only jpg or png allowed.");
            cb(null, false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 *2
    }
})

// GET commissions
router.get('/commissions', (req, res) => {
    res.json({mssg: 'get all commissions'});
});

// GET single order
router.get('/:id', getOrder);


// DELETE an order
router.delete('/:id', deleteOrder);

// UPDATE an order
router.patch('/:id', updateOrder);

// GET all orders
router.get('/', getOrders);

// POST new order
router.post('/', upload.single('referenceImages'), postOrder);

module.exports = router;