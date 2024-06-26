import { QuestionFieldsContext } from '../../context/';
import { useContext, useEffect, useReducer, useState } from 'react';
import styles from './ActiveForm.module.css';

import { ImagePreview, Line, NoDataPlaceholder } from '../../components/';
import { useParams } from 'react-router-dom';

import activeFormImg from '../../assets/images/ezcoms_activeform_bg.png';
import { orderMessageReducer } from '../reducers/orderMessageReducer';
import { ACTION } from '../reducers/orderMessageReducer';
import { PageContainer } from '../../layouts';
import AlertMessage from '../../components/alert-message/AlertMessage';

const ActiveForm = () => {
    const [activeForm, setActiveForm] = useState(null);
    const [clientName, setClientName] = useState('');
    const [clientContact, setClientContact] = useState('');
    const [requestDetail, setRequestDetail] = useState('');
    const [referenceImages, setReferenceImages] = useState([]);
    const [price, setPrice] = useState(-1);
    const [loading, setLoading] = useState(true);

    const { questionFieldList, setQuestionFieldList } = useContext(QuestionFieldsContext);

    const [state, dispatch] = useReducer(orderMessageReducer);

    console.log(price);

    const { userID } = useParams();

    const fetchActiveForm = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:4000/api/forms/active/' + userID, {
                method: 'GET'
            });

            if (response.ok) {
                const responseJson = await response.json();

                console.log('Response json: ', responseJson);

                if (responseJson.length === 0) {
                    return;
                }
                setActiveForm(responseJson[0]);
            } else {
                throw new Error(response.statusText);
            }
        } catch (error) {
            dispatch({ type: ACTION.ERROR_CUSTOM, payload: error.message });
        } finally {
            setLoading(false);
        }
    };
    // const fetchAllForms = async () => {
    //     if (!user) {
    //         return;
    //     }
    //     const response = await fetch('http://localhost:4000/api/forms/', {
    //         headers: {
    //             'Authorization': `Bearer ${user.token}`
    //         }
    //     });
    //     const json = await response.json();

    //     if (response.ok) {
    //         setForms(json);
    //         console.log("Form page: Fetched all forms in ActiveForm! ", forms);
    //         //findActiveForm();
    //     }
    // };

    // const findActiveForm = () => {
    //     console.log("Here")
    //     if (forms.length === 0) {
    //         setNoActiveForm(true);
    //         console.log("empty!!!!!");
    //         return;
    //     }

    //     let form = forms[0]; // the active form is always at the front of the list of forms

    //     if (!form) {
    //         return null;
    //     } else if (form.activeStatus === false) {
    //         setNoActiveForm(true);
    //         return null;
    //     }

    //     setActiveForm(form);
    //     console.log("form: ", form);

    //     if (activeForm != null) {
    //         setQuestionFieldList(activeForm.questions);
    //         console.log("Status: ", activeForm.activeStatus)
    //         console.log("setQList");
    //     }
    //     return form;
    // };

    const handleClientNameChange = (e) => {
        setClientName(e.target.value);
    };

    const handleClientContactChange = (e) => {
        setClientContact(e.target.value);
    };

    const handleRequestDetailChange = (e) => {
        setRequestDetail(e.target.value);
    };

    const handleAnswerFieldChange = (e, questionId) => {
        let questionListCopy = [...questionFieldList];
        for (let i = 0; i < questionListCopy.length; i++) {
            if (questionListCopy[i].id === questionId) {
                questionListCopy[i].questionAns = e.target.value;
                break;
            }
        }
        setQuestionFieldList(questionListCopy);
    };

    const handleImages = (e) => {
        e.preventDefault();
        const files = e.target.files; // NOT AN ARRAY!

        let filesArray = Array.from(files);
        filesArray = referenceImages.concat(filesArray);

        setReferenceImages(filesArray);
    };

    const handleDeleteImg = (e, img) => {
        e.preventDefault();
        const refImgs = referenceImages.filter((image) => image !== img);

        setReferenceImages(refImgs);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch({ type: ACTION.LOADING });
        let questionListCopy = [...questionFieldList];

        // go through all the multiple choice questions to see what option was selected for them
        for (let i = 0; i < questionListCopy.length; i++) {
            if (questionListCopy[i].type === 'mc') {
                var selectedAns = document.getElementsByName('option' + questionListCopy[i].id);
                for (let j = 0; j < selectedAns.length; j++) {
                    //console.log(selectedAns[j].value)
                    if (selectedAns[j].checked) {
                        questionListCopy[i].questionAns = selectedAns[j].value;
                    }
                }
            }
        }

        setQuestionFieldList(questionListCopy);

        const dateObj = new Date();
        const currDate = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
        let userDeadline = document.getElementById('deadline').value;
        if (userDeadline === '') {
            userDeadline = '9999-12-31';
        }

        const order = new FormData();

        order.append('orderName', `${clientName}'s Order`);
        order.append('clientName', clientName);
        order.append('clientContact', clientContact);
        order.append('requestDetail', requestDetail);
        for (let i = 0; i < questionFieldList.length; i++) {
            order.append('fillouts', JSON.stringify(questionFieldList[i]));
        }
        console.log('Reference images: ', referenceImages);
        for (let i = 0; i < referenceImages.length; i++) {
            order.append('referenceImages[]', referenceImages[i]);
        }
        order.append('dateReqqed', currDate);
        order.append('datePaid', 'To be set');
        order.append('dateCompleted', 'To be set');
        order.append('deadline', userDeadline);
        order.append('status', 'Not Started Yet');
        order.append('artistNotes', '');
        order.append('editedStatus', false);
        order.append('userID', userID);
        order.append('price', price);
        try {
            const response = await fetch('http://localhost:4000/api/orders', {
                method: 'POST',
                body: order
            });
            if (response.ok) {
                dispatch({ type: ACTION.SUCCESS_UPLOAD });
                // clearForm();
            } else {
                throw new Error(response.statusText);
            }
        } catch (err) {
            dispatch({ type: ACTION.ERROR_CUSTOM, payload: err.message });

            console.log('HHH', err);
        }

        setTimeout(() => {
            dispatch({ type: ACTION.RESET });
        }, 3000);
    };

    const clearForm = () => {
        setClientContact('');
        setClientName('');
        setRequestDetail('');
        setReferenceImages([]);
        const options = document.querySelectorAll('input[type="radio"]');
        options.forEach((option) => {
            option.checked = false;
        });
        const textInputs = document.querySelectorAll('input[type="text"]');
        textInputs.forEach((textInput) => {
            textInput.value = '';
        });
        // console.log('cleared form');
    };

    // First, fetch all the forms
    // useEffect( () => {
    //     if (user) {
    //         console.log("hhh")
    //         fetchAllForms();
    //     }
    //     //setQuestionFieldList(activeForm.questions);
    // }, []);

    // Now, after all the forms have been fetched, find the active form
    useEffect(() => {
        fetchActiveForm();
    }, []);

    // Finally, after you find the active form, populate the question fields list with the active form's questions
    useEffect(() => {
        //console.log('Q LIST is now: ', questionFieldList)
        if (activeForm != null) {
            setQuestionFieldList(activeForm.questions);
            console.log(activeForm.questions);
            // console.log('setQList');
        }
    }, [activeForm]);

    useEffect(() => {
        // console.log('Q LIST: ', questionFieldList);
    }, [questionFieldList]);

    useEffect(() => {
        // console.log('Ref images: ', referenceImages);
    }, [referenceImages]);
    // Notice we need all these three steps because of how usestate and fetches are asynchronous, so anytime we need to
    // use asynchronous data, we need to make sure it actually fetched properly first.

    return (
        <PageContainer>
            <form onSubmit={handleSubmit} className={styles.activeFormContainer} encType="multipart/form-data">
                {loading && <div className="page-container flex-row justify-content-center align-items-center font-size-3">Loading...</div>}
                {!loading && !activeForm && <NoDataPlaceholder message="No active form." src={activeFormImg} />}
                {!loading && activeForm && (
                    <div className={styles.activeFormContent}>
                        <div className="flex-col justify-content-start align-items-start w-100 gap-2">
                            <h1 className="font-size-4">New order </h1>
                            <Line/>
                        </div>
                        <div className={`flex-col gap-2 mart-3`}>
                            <label> Name (or contact name): </label>
                            <input
                                className="transparentInput blueTransparentInput pad-2 padl-3 border-box w-100 font-size-2"
                                placeholder="Name, or online alias"
                                value={clientName}
                                onChange={handleClientNameChange}
                                required={true}
                            ></input>
                            <label> Contact (email, or social media handle): </label>
                            <input
                                className="transparentInput blueTransparentInput pad-2 padl-3 border-box w-100 font-size-2"
                                type="email"
                                placeholder="someone@example.com, or social media handle"
                                value={clientContact}
                                onChange={handleClientContactChange}
                                required={true}
                            ></input>
                        </div>
                        <b>Questions</b>
                        <div className={styles.customQuestions}>
                            {questionFieldList &&
                                questionFieldList.length >= 1 &&
                                questionFieldList.map((question) => {
                                    if (question.type === 'shortAns') {
                                        return (
                                            <div className="flex-col gap-2 mary-3">
                                                <label>{question.questionLabel} </label>
                                                <input
                                                    className="transparentInput blueTransparentInput pad-2 padl-3 border-box w-100 font-size-2"
                                                    type="text"
                                                    onChange={(e) => handleAnswerFieldChange(e, question.id)}
                                                    required={true}
                                                    placeholder="Answer"
                                                />
                                            </div>
                                        );
                                    } else if (question.type === 'mc') {
                                        return (
                                            <div className={styles.mc}>
                                                <label className={styles.qLabel}>{question.questionLabel}: </label>
                                                <div className={styles.options}>
                                                    {question.optionList.length >= 1 &&
                                                        question.optionList.map((option) => {
                                                            return (
                                                                <label className={styles.option}>
                                                                    <input type="radio" name={'option' + question.id} value={option.optionLabel}></input>
                                                                    <p>{option.optionLabel}</p>
                                                                </label>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        );
                                    }
                                })}
                        </div>
                        <div className="flex-col gap-3">
                            <div className="flex-col gap-2">
                                <p>Order details:</p>
                                <textarea className="textArea" type="text" placeholder="Request details" value={requestDetail} onChange={handleRequestDetailChange} required></textarea>
                            </div>
                            <label className="flex-col gap-2">
                                <p>References:</p>
                                <input className="chooseFilesInput" type="file" name="referenceImages" onChange={handleImages} accept=".png, .jpeg, .jpg" multiple></input>
                                {/* <div className="customFileInputContainer"> */}
                                <span className="customFileInput">Choose Files</span>
                                {/* </div> */}
                            </label>
                            {referenceImages && referenceImages.length > 0 && (
                                <div className="flex-row gap-3 h-100 w-100 padb-2 overflow-x-auto">
                                    {referenceImages.map((refImgURL) => {
                                        return <ImagePreview image={refImgURL} handleDeleteImg={handleDeleteImg} />;
                                    })}
                                </div>
                            )}
                            <div className="flex-col gap-2">
                                <p>Deadline:</p>
                                <div className="dateContainer">
                                    <input className="dateInput" type="date" id="deadline"></input>
                                </div>
                                <p className="font-size-1">Please leave blank if there is no hard deadline.</p>
                            </div>
                            <div className="flex-col gap-2">
                                <p>Price:</p>
                                <div className="priceContainer">
                                    <input className="priceInput pad-1" style={{ borderRadius: '5px', maxWidth: '100px' }} type="number" id="price" onChange={(e) => setPrice(e.target.value)}></input>
                                </div>
                                <p className="font-size-1">
                                    Please leave blank if it has not been decided. Note: This should be a price agreed upon between the artist and you. The artist can change this price if it is
                                    incorrect.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {state && state.loadingMessage && <div className="loadingMessage">{state.loadingMessage}</div>}
                {state && state.successMessage && <AlertMessage alertType="success" message={state.successMessage} />}
                {state && state.errorMessage && <AlertMessage alertType="error" message={state.errorMessage} />}

                {!loading && activeForm && (
                    <button
                        disabled={loading || (state && state.loadingMessage)}
                        type="submit"
                        className="fill-button bg-blue-500 text-grey-50 pad-3 mary-4 font-weight-700 font-size-2 radius-3"
                        onClick={handleSubmit}
                    >
                        Submit Order
                    </button>
                )}
            </form>
        </PageContainer>
    );
};

export default ActiveForm;
