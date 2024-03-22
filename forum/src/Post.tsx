import { useParams } from "react-router-dom";
import Header from "./Header";
import { useEffect } from "react";

function Post() {
    const { id } = useParams()
    
    useEffect(() => {
        
    }, [])



  return (
  <div>
    <Header />
    Post id {id}
  </div>
  )
}

export default Post;
