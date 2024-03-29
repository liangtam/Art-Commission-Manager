import styles from './OrderDetails.module.css';
import { useState, useEffect, useReducer } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {ImageComponent, ImagePreview, YesNoPopup} from '../../components/';
import { orderMessageReducer, ACTION } from '../reducers/orderMessageReducer.js';
import { useAuthContext } from '../../hooks/useAuthContext.js';

// This is for actually editing the client's order details
const EditOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState('');
    const [fillouts, setFillouts] = useState([]);
    const [clientName, setClientName] = useState('');
    const [requestDetail, setRequestDetail] = useState('');
    const [referenceImages, setReferenceImages] = useState([]);
    const [refImgsToDelete, setRefImgsToDelete] = useState([]);
    const [uploadedReferenceImages, setUploadedReferenceImages] = useState([]);

    const [openPopup, setOpenPopup] = useState(false);

    const [state, dispatch] = useReducer(orderMessageReducer, {
        successMessage: '',
        errorMessage: '',
        loadingMessage: ''
    });

    const { user } = useAuthContext();

    useEffect(() => {
        fetchOrder();
    }, []);

    useEffect(() => {
        let questions = [];

        // Setting the order fillouts
        if (Array.isArray(order.fillouts)) {
            for (let i = 0; i < order.fillouts.length; i++) {
                // need to parse JSON stringified object back into an object
                console.log('question before parse: ', order.fillouts[i]);
                let question = JSON.parse(order.fillouts[i]);
                console.log('question after parse: ', question);
                questions.push(question);
            }
        }
        setFillouts(questions);

        // Checking the radio button with the order's status
        const statusRadios = Array.from(document.getElementsByName('statusSelection'));
        console.log("Fetched order's status: ", order.status);
        for (let i = 0; i < statusRadios.length; i++) {
            if (statusRadios[i].id === order.status) {
                statusRadios[i].checked = true;
                break;
            }
        }

        setClientName(order.clientName);
        setReferenceImages(order.referenceImages);
        setRequestDetail(order.requestDetail);
    }, [order]);

    const fetchOrder = async () => {
        const response = await fetch('http://localhost:4000/api/orders/' + id, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        });

        if (response.ok) {
            const json = await response.json();
            setOrder(json);
            console.log('Fetched order: ', json);
        } else {
            console.log('response not ok');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        dispatch({ type: ACTION.LOADING });
        let newOrder = new FormData();
        newOrder.append('clientName', clientName);
        newOrder.append('clientContact', order.clientContact);
        newOrder.append('requestDetail', requestDetail);
        for (let i = 0; i < fillouts.length; i++) {
            newOrder.append('fillouts', JSON.stringify(fillouts[i]));
        }
        for (let i = 0; i < uploadedReferenceImages.length; i++) {
            newOrder.append('uploadedReferenceImages[]', uploadedReferenceImages[i]);
        }
        newOrder.append('price', order.price);
        newOrder.append('dateReqqed', order.dateReqqed);
        newOrder.append('datePaid', order.datePaid);
        newOrder.append('dateCompleted', order.dateCompleted);
        newOrder.append('deadline', order.deadline);
        newOrder.append('editedStatus', order.editedStatus);
        newOrder.append('originalUneditedOrder', JSON.stringify(order.originalUneditedOrder));

        // not part of Order schema
        for (let i = 0; i < refImgsToDelete.length; i++) {
            newOrder.append('refImgsToDelete[]', JSON.stringify(refImgsToDelete[i]));
        }

        const response = await fetch('http://localhost:4000/api/orders/edit/' + id, {
            method: 'PATCH',
            body: newOrder,
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        });

        if (response.ok) {
            console.log('Updated order! ', newOrder);
            fetchOrder();
            dispatch({ type: ACTION.SUCCESS_UPDATE });
            setTimeout(() => {
                dispatch({ type: ACTION.RESET });
            }, 3000);
        } else {
            console.log('Error: Order was NOT updated :(');
            dispatch({ type: ACTION.ERROR_UPDATE });
            setTimeout(() => {
                dispatch({ type: ACTION.RESET });
            }, 3000);
        }
    };

    // const handleClientNameChange = (e) => {
    //     setClientName(e.target.value);
    // }

    // const handleRequestDetailChange = (e) => {
    //     setRequestDetail(e.target.value);
    // }

    const handleFilloutChange = (e, questionId) => {
        let newFillouts = [...fillouts];
        for (let i = 0; i < newFillouts.length; i++) {
            if (newFillouts[i].id === questionId) {
                newFillouts[i].questionAns = e.target.value;
                break;
            }
        }
        setFillouts(newFillouts);
    };

    const handleDeleteImage = (e, image) => {
        e.preventDefault();
        setReferenceImages(referenceImages.filter((img) => img !== image)); // these are the ref imgs the order already had
        console.log('Image param: ', image);
        setRefImgsToDelete([...refImgsToDelete, image]);
    };

    const handleDeleteUploadedImage = (e, img) => {
        e.preventDefault();
        setUploadedReferenceImages(uploadedReferenceImages.filter((image) => image !== img));
    };

    const handleAddImage = (e) => {
        const files = Array.from(e.target.files);
        setUploadedReferenceImages(uploadedReferenceImages.concat(files));
    };

    const handleOpenPopup = (e) => {
        e.preventDefault();
        setOpenPopup(true);
    };

    const closePopup = (e) => {
        setOpenPopup(false);
    };

    const handleDeleteOrder = async (e) => {
        dispatch({ type: ACTION.LOADING });
        const response = await fetch('http://localhost:4000/api/orders/' + id, {
            method: 'DELETE'
        });

        if (response.ok) {
            navigate('/orders/');
        } else {
            console.log('Error! ', response.statusText);
            dispatch({ type: ACTION.ERROR_DELETE });
        }
    };

    return (
        <div className={styles.orderDetailsContainer}>
            <button className="blueButton" onClick={(e) => navigate(`/orders/${id}`)}>
                Back
            </button>
            <div className={styles.orderDetailsContent}>
                <div className={styles.leftSide}>
                <div className={styles.orderDefaultDetails}>

                    <h3>
                        <strong>Client name: </strong>
                        <input className="transparentInput" type="text" value={clientName} onChange={(e) => setClientName(e.target.value)}></input>
                    </h3>
                    <p>
                        <strong> Client contact: </strong> {order && order.clientContact}
                    </p>
                    <p>
                        <strong>
                            Request: <br></br>
                        </strong>
                        <textarea className="textArea" type="text" value={requestDetail} onChange={(e) => setRequestDetail(e.target.value)}></textarea>
                    </p>
                    <p>
                        <strong> Requested on: </strong> {order && order.dateReqqed}
                    </p>
                    <p>
                        <strong> Deadline:</strong> {order && order.deadline}
                    </p>
                    </div>

                    <div className={styles.fillouts}>
                        <h4>Form fillouts:</h4>
                        {fillouts &&
                            fillouts.map((question) => {
                                return (
                                    <div className={styles.question}>
                                        <b>{question.questionLabel + ': '}</b>
                                        <input className="transparentInput" type="text" value={question.questionAns} onChange={(e) => handleFilloutChange(e, question.id)}></input>
                                    </div>
                                );
                            })}
                    </div>
                </div>
                <div className={styles.rightSide}>
                <div className={styles.refImagesTitle}>
                    <p>
                        <b>Reference images: </b>
                    </p>
                </div>
                <div className={styles.refImages}>
                    {referenceImages &&
                        referenceImages.map((refImg) => {
                            return <ImageComponent image={refImg} handleDeleteImage={handleDeleteImage}></ImageComponent>;
                        })}
                </div>
                <label className={styles.fileInputContainer}>
                    <p>Upload More Reference Images:</p>
                    <input className="chooseFilesInput" type="file" accept=".png, .jpeg, .jpg" name="artistImages" onChange={handleAddImage} multiple></input>
                    <span className="customFileInput">Choose Files</span>
                </label>
                <br></br>

                <div className={styles.imgPreview}>
                    {uploadedReferenceImages &&
                        uploadedReferenceImages.map((img) => {
                            return <ImagePreview image={img} handleDeleteImg={handleDeleteUploadedImage}></ImagePreview>;
                        })}
                </div>
                {state.errorMessage && <div className="errorMessage">{state.errorMessage}</div>}
                {state.successMessage && <div className="successMessage">{state.successMessage}</div>}
                {state.loadingMessage && <div className="loadingMessage">{state.loadingMessage}</div>}
                <div className={styles.buttons}>
                    <button className="blueButton saveBtn font-weight-400" onClick={handleSave}>
                        Save
                    </button>
                    <button className="blueButton deleteBtn font-weight-400" onClick={handleOpenPopup}>
                        Delete
                    </button>
                </div>
                {openPopup && (
                    <YesNoPopup closePopup={closePopup} yesFunction={handleDeleteOrder}>
                        <h3>Are you sure?</h3>
                        <p>Are you sure you want to delete this order? This action cannot be undone.</p>
                    </YesNoPopup>
                )}
                </div>
               
            </div>
        </div>
    );
};

export default EditOrderDetails;
