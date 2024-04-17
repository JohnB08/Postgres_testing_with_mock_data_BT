import style from "./Header.module.css"
import { Logo } from "../Logo/Logo"
import { HeaderText } from "../HeaderText/HeaderText"


export const Header = ()=>{
    return (
        <header className={style.header}>
            <Logo/>
            <HeaderText/>
        </header>
    )
}