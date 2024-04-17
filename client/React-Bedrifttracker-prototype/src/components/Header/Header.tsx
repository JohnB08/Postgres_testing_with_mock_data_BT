import style from "./Header.module.css"
import { Logo } from "../Logo/Logo"


export const Header = ()=>{
    return (
        <header className={style.header}>
            <Logo/>
        </header>
    )
}