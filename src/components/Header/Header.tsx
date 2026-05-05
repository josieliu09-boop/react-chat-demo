import './Header.css'

function Header({onLogout}:{onLogout:()=>void}) {
    return (
        <div className="header">
           <div className="header-content">
             <div>
                <h1>AI Chat Demo</h1>
            <p>React+TypeScript</p>
             </div>
             <button className='logout-btn' onClick={onLogout}
             >退出登录</button>
           </div>
        </div>
    )
}
export default Header