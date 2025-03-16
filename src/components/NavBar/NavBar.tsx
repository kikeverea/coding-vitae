interface NavBarItem {
  name: string
  link: string
}

const NavBar = ({ items } : { items: NavBarItem[]}) => {
  return (
    <div className="nav-bar">
      { items.map((item: NavBarItem) =>
        <a href={item.link}>{item.name}</a>
      )}
    </div>
  )
}

export default NavBar