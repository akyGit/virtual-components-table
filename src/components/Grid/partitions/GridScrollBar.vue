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
  },

  data() {
    return {
      dragging: false,
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
    startDrag() {
      this.dragging = true;
      if (this.onScrollStart) this.onScrollStart();
    },

    stopDrag() {
      this.dragging = false;
      if (this.onScrollEnd) this.onScrollEnd(this.interpolated);
    },

    mouseDown(e) {
      this.$refs.thumb.addEventListener('mousemove', this.move, true);
    },

    move: throttle(function(e) {
      if (this.dragging) {
        if (this.timeoutId === -1 && this.onScrollContinue) {
          this.onScrollContinue();
        }

        let newValue = this.vertical
          ? e.clientY - this.$el.offsetTop - this.$refs.thumb.clientHeight / 2
          : e.clientX - this.$el.offsetLeft - this.$refs.thumb.clientWidth / 2;

        let interpolated = this.vertical
          ? (newValue / this.$el.clientHeight) * this.maxValue
          : (newValue / this.$el.clientWidth) * this.maxValue;

        if (newValue < 0) { newValue = 0; interpolated = 0; }
        if (newValue > (this.vertical
          ? this.$el.clientHeight - this.$refs.thumb.clientHeight
          : this.$el.clientWidth - this.$refs.thumb.clientWidth)
        ) {
          newValue = this.vertical
            ? this.$el.clientHeight - this.$refs.thumb.clientHeight
            : this.$el.clientWidth - this.$refs.thumb.clientWidth;

          interpolated = this.maxValue;
        }

        this.interpolated = interpolated;

        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
          if (this.onScrollDelay) this.onScrollDelay(this.interpolated);
          this.timeoutId = -1;
        }, this.delay);

        if (newValue + 'px' !== (this.vertical ? this.$refs.thumb.style.top : this.$refs.thumb.style.left)) {
          if (this.vertical) this.$refs.thumb.style.top = newValue + 'px';
          else this.$refs.thumb.style.left = newValue + 'px';

          if (this.onScroll) this.onScroll(interpolated);
        }
      }
    }, 30),
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
