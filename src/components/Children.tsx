import * as React from 'react'

const Children:React.FC = (props)=>{
    console.log(props,'props')
    return( 
    <div className="red">
        这是一个子组件</div>)
}
export default Children