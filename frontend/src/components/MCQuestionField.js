import { useState, useEffect } from "react";
import MCOptionField from './MCOption';

const MCQuestionField = ({fieldId, handleFieldChange, handleRemoveField}) => {
    
    const [optList, setOptList] = useState([]);

    const handleOptionFieldChange = (e, optionFieldId) => {
        let newOptList = [...optList];
        newOptList.map((option) => {
            if (option.optionId === optionFieldId) {
                option.optionLabel = e.target.value;
            }
        })
    };

    const handleRemoveOptionField = (e, optionFieldId) => {
        e.preventDefault();
        let newOptList = optList.filter((option) => option.optionFieldId !== optionFieldId);
        setOptList(newOptList);
    };

    const handleOptionClick = (e) => {
        e.preventDefault();
        const newOptionObj = {
            optionId: optList.length,
            optionLabel: "",
            optionAns: ""
        }
        setOptList([...optList, newOptionObj]);
    };

    useEffect(() => {
        console.log(optList);
    }, [optList]);

    return (
    <div className="mc-question-field-component">
        <input key='mc-question-field' type='text' placeholder="MC Question"
        onChange={(e) => handleFieldChange(e, fieldId)}
        ></input>

        <button onClick={(e) => handleRemoveField(e, fieldId)}>Remove</button>  
        <button onClick={handleOptionClick}>Add Option</button>
        {/* Displaying MC options, if there are any*/}
        {((optList.length >= 1) && optList.map((option) => {
                return <MCOptionField handleOptionFieldChange={handleOptionFieldChange}
                                      handleRemoveOptionField={handleRemoveOptionField}
                                      optionFieldId={option.optionFieldId}/>;
        }))}

    </div>
    
    );
}

export default MCQuestionField;