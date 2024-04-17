import style from "./HeaderText.module.css"

export const HeaderText = () =>{
    return (
        <div className={style.headerText}>
        <h1>ProTurle</h1>
        <p>“See the TURTLE of enormous girth! On his shell he holds the <s>earth</s> data.”</p>
        </div>
    )
}