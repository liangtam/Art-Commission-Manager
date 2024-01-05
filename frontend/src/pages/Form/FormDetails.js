import { useState, useEffect, useContext, useReducer } from 'react';
import ShortAnswerQField from '../../components/question_components/ShortAnsQ';
import { useNavigate, useParams } from 'react-router-dom';
import { QuestionFieldsContext } from '../../context/QuestionFieldsContext';
import { FormsContext } from '../../context/FormsContext';

import styles from './FormBuilder.module.css';
import MCQuestionField from '../../components/question_components/MCQuestionField';
import YesNoPopup from '../../components/form_components/YesNoPopup';
import { useAuthContext } from '../../hooks/useAuthContext';
import { formMessageReducer, ACTION } from '../reducers/formMessageReducer';

const FormDetails = () => {
    const { id } = useParams();
    const { questionFieldList, setQuestionFieldList } = useContext(QuestionFieldsContext);

    const { forms, setForms } = useContext(FormsContext);

    const navigate = useNavigate();

    const [formName, setFormName] = useState('');
    const [activeStatus, setActiveStatus] = useState(false);
    const [wasAlreadyActive, setWasAlreadyActive] = useState(false);
    const [form, setForm] = useState(null);
    const [error, setError] = useState(null);
    const [activeFormReplacementOpenPopup, setActiveFormReplacementOpenPopup] = useState(false);
    const [openDeletePopup, setOpenDeletePopup] = useState(false);

    const { user } = useAuthContext();
    const [state, dispatch] = useReducer(formMessageReducer, {});

    const fetchForm = async () => {
        if (!user) {
            return;
        }
        try {
            const response = await fetch('http://localhost:4000/api/forms/' + id, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });

            console.log('formId: ', id);
            const json = await response.json();
            // console.log(json);
            if (response.ok) {
                console.log('Response was ok');
                if (!json || json.length === 0) {
                    setError('No form found.');
                    return;
                }
                setForm(json);
                setQuestionFieldList(json.questions);
                setFormName(json.formName);
                setActiveStatus(json.activeStatus);
                if (json.activeStatus) {
                    setWasAlreadyActive(true);
                }
            }
        } catch (error) {
            console.log(error);
        }
        // if (form !== null) {
        //     console.log("here");
        //     setQuestionFieldList(form.questions);
        // }
    };

    const handleNameChange = (e) => {
        e.preventDefault();
        setFormName(e.target.value);
    };

    const toggleActiveStatus = (e) => {
        e.preventDefault();
        setActiveStatus(!activeStatus);
    };
    /* 
    EFFECT: creates a new short ans question object and adds it to questionFieldList
    */
    const handleShortAnswerClick = (e) => {
        e.preventDefault();
        if (!user) {
            return;
        }
        const newShortAnsId = questionFieldList.length;
        const newQObj = {
            id: newShortAnsId,
            type: 'shortAns',
            questionLabel: '',
            questionAns: ''
        };
        setQuestionFieldList([...questionFieldList, newQObj]);
    };

    /* 
    EFFECT: creates a new multiple choice question object and adds it to questionFieldList
    */
    const handleMCClick = (e) => {
        e.preventDefault();
        const newMcQId = questionFieldList.length;
        const newQObj = {
            id: newMcQId,
            type: 'mc',
            questionLabel: '',
            questionAns: '',
            optionList: [],
            optionAns: []
        };
        setQuestionFieldList([...questionFieldList, newQObj]);
    };

    const handleSaveClick = async (e) => {
        e.preventDefault();
        if (!user) {
            return;
        }
        // console.log('here');

        if (formName === '') {
            setError({ error: 'Please provide a name for this form.' });
            return (
                <div>
                    <text>{error.message}</text>
                </div>
            );
        }

        // making sure there is only one active form at a time by ensuring the active form (if any) is in the beginning of the forms array
        if (wasAlreadyActive) {
            // console.log('was already active');
            saveForm();
        } else if (activeStatus === true) {
            // console.log('boop');
            if (forms.length > 0) {
                const activeForm = findActiveForm();

                // if (activeForm.activeStatus === true) {
                //     const confirmBox = window.confirm("Setting this form as active makes your current active form inactive. Would you like to set this form to be active instead of the current active form?");

                //     let formsCopy = [...forms];

                //     if (confirmBox === true) {
                //         formsCopy[0].activeStatus = false;
                //         console.log("HERE");
                //         replaceActiveForm(activeForm);
                //         //formsCopy.unshift(updatedForm); // pushes our form to the front of list of form
                //         console.log("got hereee ", form.activeStatus)
                //     } else {
                //         updatedForm = {formName, questions, activeStatus:false};
                //        // formsCopy.push(updatedForm);
                //         setForms(formsCopy);
                //         console.log("got here :000 ", updatedForm)
                //     }
                // }
                if (activeForm.activeStatus === true) {
                    setActiveFormReplacementOpenPopup(true);
                } else {
                    saveForm();
                }
            }
        } else {
            saveForm();
        }
    };

    const saveForm = async () => {
        let questions = [];
        for (let i = 0; i < questionFieldList.length; i++) {
            if (questionFieldList[i].questionLabel !== '') {
                questions.push(questionFieldList[i]);
            }
        }

        let updatedForm = { formName, questions: questions, activeStatus, user_id: user._id };

        const response = await fetch('http://localhost:4000/api/forms/' + id, {
            method: 'PATCH',
            body: JSON.stringify(updatedForm),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`
            }
        });

        const json = await response.json();

        if (response.ok) {
            console.log('Form updated!', json);
            setQuestionFieldList(updatedForm.questions);
            setFormName(updatedForm.formName);
            setActiveStatus(updatedForm.activeStatus);
        } else {
            setError(json.error);
        }

        setActiveFormReplacementOpenPopup(false);
        navigate('/forms');
    };

    const replaceActiveForm = async () => {
        if (!user) {
            return;
        }
        const activeForm = findActiveForm();
        console.log("currActiveForm's status", activeForm.activeStatus);
        const idOfCurrActiveForm = activeForm._id;

        activeForm.activeStatus = false;
        console.log("forms[0]'s status after replaced: ", forms[0].activeStatus, activeForm.activeStatus);

        const response = await fetch('http://localhost:4000/api/forms/' + idOfCurrActiveForm, {
            method: 'PATCH',
            body: JSON.stringify(activeForm),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`
            }
        });

        const json = await response.json();

        if (response.ok) {
            console.log('Made the original active form inactive!', json);
        } else {
            setError(json.error);
        }
        setActiveFormReplacementOpenPopup(false);
    };

    const findActiveForm = () => {
        let form = forms[0];
        // for (let i = 0; i < forms.length; i++) {
        //     if (forms[i].activeStatus === true) {
        //         form = forms[i];
        //     }
        // }

        return form;
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        if (!user) {
            return;
        }
        console.log('here, ', id);
        try {
            const response = await fetch('http://localhost:4000/api/forms/' + id, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                // console.log('Form deleted!');
                navigate('/forms');
            }
        } catch (error) {
            console.log('Error deleting form: ', error);
        }
    };

    useEffect(() => {
        fetchForm();
    }, []);

    useEffect(() => {
        console.log(questionFieldList);
    }, [questionFieldList]);

    return (
        <div className={styles.formBuilderContainer}>
            <div className="pageTitle">
                <h1>Edit Form</h1>
            </div>
            <form className={styles.formBuilderContent}>
                {activeFormReplacementOpenPopup && (
                    <YesNoPopup
                        yesFunction={(e) => {
                            replaceActiveForm();
                            saveForm();
                        }}
                        closePopup={(e) => setActiveFormReplacementOpenPopup(false)}
                    >
                        <h3>Another Form Is Currently Active</h3>
                        <p>Setting this form as active will make your current active form inactive. Would you like to set this form to be active instead of the current active form?</p>
                    </YesNoPopup>
                )}
                {openDeletePopup && (
                    <YesNoPopup yesFunction={handleDelete} closePopup={(e) => setOpenDeletePopup(false)}>
                        <h3>Are you sure?</h3>
                        <p>Are you sure you want to delete this form? This action cannot be undone.</p>
                    </YesNoPopup>
                )}

                <div className={`${styles.formName} ${styles.formContent}`}>
                    <h4>
                        Name of form: <input className="transparentInput" type="text" onChange={handleNameChange} value={formName} placeholder="Coolest form"></input>
                    </h4>
                </div>
                {form && (
                    <div className={styles.questions}>
                        {questionFieldList &&
                            questionFieldList.map((question) => {
                                if (question.type === 'shortAns') {
                                    return (
                                        <div className={styles.question}>
                                            <ShortAnswerQField fieldId={question.id} labelValue={question.questionLabel} key={'saq' + question.id} />
                                        </div>
                                    );
                                } else if (question.type === 'mc') {
                                    return (
                                        <div className={styles.question}>
                                            <MCQuestionField fieldId={question.id} labelValue={question.questionLabel} optList={question.optionList} key={'mcq' + question.id} />
                                        </div>
                                    );
                                }
                            })}
                    </div>
                )}
                <div className={styles.createQuestions}>
                    <div className={styles.questionButtons}>
                        <button className={`${styles.formBuilderBtn}`} onClick={handleShortAnswerClick}>
                            Add Short Answer
                        </button>
                        <button className={`${styles.formBuilderBtn}`} onClick={handleMCClick}>
                            Add Multiple Choice
                        </button>
                    </div>
                </div>
                <div className={styles.activeStatus}>
                    <button className={`${styles.formBuilderBtn} ${styles.activeStatusBtn}`} onClick={toggleActiveStatus}>
                        Set Active
                    </button>
                    <div className={`${activeStatus ? styles.active : styles.inactive} ${styles.activeStatus}`}>{activeStatus ? 'Active' : 'Inactive'}</div>
                </div>

                {state.errorMessage && <div className="errorMessage">{state.errorMessage}</div>}
                {state.successMessage && <div className="successMessage">{state.successMessage}</div>}
                {state.loadingMessage && <div className="loadingMessage">{state.loadingMessage}</div>}

                <div className={styles.formDetailsBottomButtons}>
                    <button className={`blueButton deleteBtn`}  onClick={(e) => setOpenDeletePopup(true)}>Delete</button>
                    <button className={`blueButton saveBtn`} onClick={handleSaveClick}>
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormDetails;
