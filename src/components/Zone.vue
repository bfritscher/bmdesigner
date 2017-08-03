<template>
  <div class="zone dropzone">
    <div class="label">{{label}}</div>
  </div>
</template>

<script>
import interact from 'interactjs';

export default {
  name: 'zone',
  props: ['label', 'dropzoneAccept'],
  data() {
    return {
      dropzone: null,
    };
  },
  mounted() {
    // const accept = this.dropzoneAccept;
    this.dropzone = interact(this.$el).dropzone({
      accept: this.dropzoneAccept,
      // Require a 75% element overlap for a drop to be possible
      overlap: 0.75,
      ondropactivate: (event) => {
        // add active dropzone feedback
        event.target.classList.add('drop-active');
      },
      ondragenter: (event) => {
        const draggableElement = event.relatedTarget;
        const dropzoneElement = event.target;

        // feedback the possibility of a drop
        dropzoneElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');
      },
      ondragleave: (event) => {
        // remove the drop feedback style
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
      },
      ondrop: (event) => {
        event.relatedTarget.classList.remove('can-drop');
      },
      ondropdeactivate: (event) => {
        // remove active dropzone feedback
        event.target.classList.remove('drop-active');
        event.target.classList.remove('drop-target');
      },
    });
  },
};
</script>

<style>
.note.can-drop {
  
}

.zone {
  position: absolute;
  background-color: white;
  box-shadow: inset 0 0 0px 1px #818181;
  display: block;
  transition: background-color 0.3s;
}

.label {
  margin: 5px;
  color: #333;
}

.drop-active {

}

.drop-target {
  background-color: #dcedc8 !important;
}
</style>
