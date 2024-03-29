import styles from './YesNoPopup.module.css';

const YesNoPopup = ({children, yesFunction, closePopup}) => {
    return (
        <div className={styles.popupContainer}>
            <div className={`${styles.popupContent} flex-col align-items-center justify-content-center gap-2 pad-4 border-box radius-2`}>
                { children }
                <div className={`${styles.confirmationButtons} flex-row align-items-center justify-content-center`}>
                    <button className={`${styles.yesBtn} fill-button pad-3 radius-1`}onClick={yesFunction}>Yes</button>
                    <button className={`${styles.cancelBtn} fill-button bg-grey-800 text-grey-50 pad-3 radius-1`} onClick={closePopup}>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default YesNoPopup;