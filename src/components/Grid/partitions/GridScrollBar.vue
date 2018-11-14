<template>
  <div
    class='GridScrollBar'
    @mousemove='move'
    @mousedown="startDrag"
  >
      <div
        ref='thumb'
        :class="{
          'GridScrollBar__thumb': true,
          'GridScrollBar__thumb--vertical': vertical
        }"
      />
  </div>
</template>

<script>
import throttle from 'lodash/throttle';

export default {
  name: 'GridScrollBar',
  props: {
    vertical: {
      type: Boolean,
      default: false
    },
    value: {
      type: Number,
      default: 0,
    },
    maxValue: {
      type: Number,
      default: 100
    },
    delay: {
      type: Number,
      default: 800
    },
    onScroll: Function,
    onScrollStart: Function,
    onScrollEnd: Function,
    onScrollDelay: Function,
    onScrollContinue: Function,
    onClick: Function,
  },

  data() {
    return {
      dragging: false,
      moveFired: false,
      startDragTime: 0,
    };
  },

  mounted() {
    this.interpolated = 0;
    window.addEventListener('mouseup', this.stopDrag);
  },

  beforeDestroy() {
    clearTimeout(this.timeoutId);
  },

  methods: {
    startDrag(e) {
      this.startDragTime = Date.now();
      this.dragging = true;

      const { interpolated } = this.getNewState(e);

      this.interpolated = interpolated;

      if (this.onScrollStart) this.onScrollStart();
    },

    stopDrag(e) {
      this.dragging = false;
      if (this.onScrollEnd) this.onScrollEnd(this.interpolated);
      if (this.startDragTime && !this.moveFired && this.onClick) this.onClick(this.interpolated);
      this.moveFired = false;
      this.startDragTime = 0;
    },

    mouseDown(e) {
      this.$refs.thumb.addEventListener('mousemove', this.move, true);
    },

    move: throttle(function(e) {
      if (this.dragging) {
        this.moveFired = true;

        if (this.timeoutId === -1 && this.onScrollContinue) {
          this.onScrollContinue();
        }

        const { newPosition, interpolated } = this.getNewState(e);

        this.interpolated = interpolated;

        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
          if (this.onScrollDelay) this.onScrollDelay(this.interpolated);
          this.timeoutId = -1;
        }, this.delay);

        if (newPosition + 'px' !== (this.vertical ? this.$refs.thumb.style.top : this.$refs.thumb.style.left)) {
          if (this.vertical) this.$refs.thumb.style.top = newPosition + 'px';
          else this.$refs.thumb.style.left = newPosition + 'px';

          if (this.onScroll) this.onScroll(interpolated);
        }
      }
    }, 30),

    getNewState(e) {
      let newPosition = this.vertical
        ? e.clientY - this.$el.offsetTop - this.$refs.thumb.clientHeight / 2
        : e.clientX - this.$el.offsetLeft - this.$refs.thumb.clientWidth / 2;

      let interpolated = this.vertical
        ? (newPosition / this.$el.clientHeight) * this.maxValue
        : (newPosition / this.$el.clientWidth) * this.maxValue;

      if (newPosition < 0) { newPosition = 0; interpolated = 0; }
      if (newPosition > (this.vertical
        ? this.$el.clientHeight - this.$refs.thumb.clientHeight
        : this.$el.clientWidth - this.$refs.thumb.clientWidth)
      ) {
        newPosition = this.vertical
          ? this.$el.clientHeight - this.$refs.thumb.clientHeight
          : this.$el.clientWidth - this.$refs.thumb.clientWidth;

        interpolated = this.maxValue;
      }

      return { newPosition, interpolated };
    }
  },

  watch: {
    value(newValue) {
      if (!this.dragging) {
        let newPosition = (newValue / this.maxValue) * (this.vertical ? this.$el.clientHeight : this.$el.clientWidth);

        if (newPosition < 0) newPosition = 0;

        if (newPosition > (this.vertical
          ? this.$el.clientHeight - this.$refs.thumb.clientHeight
          : this.$el.clientWidth- this.$refs.thumb.clientWidth)) {
            newPosition = this.vertical
              ? this.$el.clientHeight - this.$refs.thumb.clientHeight
              : this.$el.clientWidth - this.$refs.thumb.clientWidth;
        }

        if (this.vertical) this.$refs.thumb.style.top = newPosition + 'px';
        else this.$refs.thumb.style.left = newPosition + 'px';
      }
    }
  }
}
</script>

<style scoped lang="less" src='./GridScrollBar.less' />
