<template>
  <div class="zone dropzone">
    <div class="label">{{label}}</div>
  </div>
</template>

<script>
import interact from 'interactjs';

export default {
  name: 'zone',
  props: ['label'],
  mounted() {
    interact('.dropzone').dropzone({
      accept: '.note',
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
        console.log(event);
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
  color: #000;
  background-color: #4e4;
}

.zone {
  position: absolute;
  border: 1px solid black;
  display: block;
  transition: background-color 0.3s;
}

.label {
  margin: 5px;
}

.drop-active {
  border-color: red;
}

.drop-target {
  background-color: #29e;
  border-color: #fff;
  border-style: solid;
}
</style>
