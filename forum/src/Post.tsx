import { useParams } from "react-router-dom";
import Header from "./Header";
import { useEffect, useState } from "react";
import { Post as PostInterface } from "./Home";

function Post() {
    const { id } = useParams()
    const [postData, setPostData] = useState<PostInterface[] | undefined>()

    useEffect(() => {
      fetch(`http://localhost:3001/post?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }})
        .then((res => res.json()))
        .then((res) => {
          console.log('res ', res)
          setPostData(res)
        })
    }, [])



  return (
  <div>
    <Header />
    Post id {id}

  </div>
  )
}

export default Post;
