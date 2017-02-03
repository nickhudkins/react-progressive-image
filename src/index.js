import React, { Component } from 'react'

export default class ProgressiveImage extends Component {

  static propTypes = {
    blur: React.PropTypes.number,
    lazy: React.PropTypes.bool,
    delay: React.PropTypes.number,
    scrollParent: (props, propName, componentName) => {
      const scrollParent = props[propName];
      if (!('addEventListener' in scrollParent)) {
        return new Error(
          'Invalid prop, `' + propName + '` supplied to `' + componentName + '`. Expecting a DOM Node'
        );
      }
    },
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    placeholder: React.PropTypes.string,
    src: React.PropTypes.string,
  }

  state = {
    aspectRatio: '0%',
    show: false,
    loaded: false,
    loading: false,
  }

  static defaultProps = {
    blur: 30,
    lazy: true,
    width: null,
    height: null,
    scrollParent: document,
    delay: 100,
    placeholder: 'https://unsplash.it/480/270?image=3',
    src: 'https://unsplash.it/4800/2700?image=3'
  }

  componentDidMount() {
    const { lazy, scrollParent, width, height } = this.props;
    if (width && height) {
      this.setState({
        aspectRatio: `${ height / width * 100 }%`
      });
    }
    if (lazy) {
      this.checkBounds();
      scrollParent.addEventListener('scroll', this.checkBounds);
      return;
    } else {
      this.loadFullImage();
    }
  }

  loadFullImage = () => {
    const { src, delay } = this.props;
    this.setState({ loading: true })
    const fullImage = new Image();
    fullImage.src = src;
    fullImage.onload = () => {
      this.setState({
        loaded: true,
        loading: false,
      }, () => {
        setTimeout(() => {
          this.setState({
            show: true,
          })
        }, delay);
      })
    }
  }

  checkBounds = () => {
    if (this.state.loading) return;
    const imageBounds = this.container.getBoundingClientRect();
    const inView = imageBounds.top + 20 < window.innerHeight && imageBounds.bottom + 20 > 0;
    if (inView) {
      this.loadFullImage();
    }
  }

  componentDidUpdate() {
    if (this.state.loaded) {
      this.props.scrollParent.removeEventListener('scroll', this.lazyListener)
    }
  }

  handlePlaceholderLoad = (e) => {
    const { width, height } = this.props;
    if (width && height) return;
    const img = e.currentTarget;
    this.setState({
      aspectRatio: (img.naturalHeight / img.naturalWidth) * 100 + '%'
    });

  }

  render() {
    const { loaded, show, aspectRatio } = this.state;
    const { placeholder, blur, src } = this.props;
    const blurAmount = show ? 0 : blur;
    return (
      <div style={{ ...styles.imageWrapper, paddingBottom: aspectRatio }} ref={(c) => { this.container = c; }}>
        <img src={ placeholder } onLoad={this.handlePlaceholderLoad} style={{ ...styles.placeholder, filter: `blur(${blur}px)` }} />
        { loaded && <img src={ src } style={{ ...styles.image, opacity: show ? 1 : 0 }} />}
      </div>
    )
  }
}

const fill = {
  position: 'absolute',
  width: '100%',
  top: 0,
  left: 0,
  transform: 'scale(1) translateZ(0)'
}

const styles = {
  placeholder: {
    ...fill,
    transition: 'filter 1s',
    boxSizing: 'border-box',
  },
  image: {
    ...fill,
    transition: 'opacity 1.3s',
  },
  imageWrapper: {
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
  }
}
