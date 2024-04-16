import React, { Component, Fragment } from 'react';

import Image from '../../../components/Image/Image';
import './SinglePost.css';
import openSocket from 'socket.io-client';
import Button from '../../../components/Button/Button';

// Bootstrap
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
// npm library
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: '',
    comment: []
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;
    fetch('http://localhost:8080/feed/post/' + postId, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch post status');
        }
        return res.json();
      })
      .then(resData => {
        this.setState({
          title: resData.post.title,
          author: resData.post.creator.name,
          image: 'http://localhost:8080/' + resData.post.imageUrl,
          date: new Date(resData.post.createdAt).toLocaleDateString('en-US'),
          content: resData.post.content,
        });
      })
      .catch(err => {
        console.log(err);
      });
    // fetch comments
    fetch('http://localhost:8080/comment/' + postId, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch comment status');
        }
        return res.json();
      })
      .then(resData => {
        this.setState({
          // save all resData.comment(which is array)'s data
          comment: resData.comments?.map(comment => {
            return {
              ...comment
            };
          })
        });
      })
      .catch(err => {
        console.log(err);
      });
    fetch('http://localhost:8080/comment/' + this.props.match.params.postId, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + this.props.token,
      }
    })
    .then(res => res.json())
    .then(resData => {
      // Only take the first 6 comments
      const comments = resData.comments.slice(-6);
      this.setState({ comment: comments });
    })
    .catch(err => {console.log(err)});
    
    // socket
    this.socket = openSocket('http://localhost:8080');
    this.socket.on('comment', data => {
      if (data.action === 'create') {
        this.addComment(data.comment);
      }
    });
  }

  componentWillUnmount() {
    // disconnect the socket when the component is unmounted
    this.socket.disconnect();
  }

  // 5개 넘으면 마지막꺼 지우고 새로운 댓글 추가
  addComment = comment => {
    console.log(comment);
    this.setState(prevState => {
      const updatedComments = [...prevState.comment];
      if (prevState.comment.length > 5) {
        updatedComments.shift();
      }
      updatedComments.push(comment);
      return {
        comment: updatedComments
      };
    });
  };

  // 댓글 등록하기
  makeComment = event => {
    if (event && event.preventDefault()){
      event.preventDefault();
    };
    const postId = this.props.match.params.postId;
    const comment = document.getElementById('comment').value;
    fetch('http://localhost:8080/comment/' + postId, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        comment: comment
      })
    })
      .then(res => {
        if (res.status !== 201) {
          throw new Error('Failed to create comment');
        }
        return res.json();
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    const notify = () => toast("댓글이 등록되었어요!");
    return (
      <Fragment>
        <section className="single-post">
          <h1>{this.state.title}</h1>
          <h2>
            Created by {this.state.author} on {this.state.date}
          </h2>
          <div className="single-post__image">
            <Image contain imageUrl={this.state.image} />
          </div>
          <p>{this.state.content}</p>
          <h2></h2>
          <Container>
            <div className="single-post__comment">
            {this.state.comment && this.state.comment.length > 0 ? (
              this.state.comment.map((c, index) => (
                <Row>
                  <Col key={index}>{c.user_name} : {c.comment}</Col>
                </Row>
              ))
            ) : (
              <p>실시간 댓글이 없어요!</p>
            )}
              <form className="form" onSubmit={this.makeComment}>
                <div className="form-control">
                  <FloatingLabel htmlFor="comment">
                  </FloatingLabel>
                    <Form.Control
                      as="textarea"
                      id="comment"
                      rows={3}
                      placeholder="정글러들의 댓글을 실시간으로 남겨주세요!">
                    </Form.Control>
                </div>
                <Button mode="hover" design="focus" onClick={notify}>댓글 등록하기</Button>
                  <ToastContainer />
              </form>
            </div>
          </Container>
        </section>
      </Fragment>
    );
  }
}

export default SinglePost;
