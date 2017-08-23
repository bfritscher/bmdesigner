<template>
  <v-navigation-drawer right temporary hide-overlay disable-route-watcher :value="$store.state.layout.focusedNote">
    <ul>
      <li class="note-item" v-for="k in $store.state.canvas.notesPresentationOrder" :data-key="k" :key="k">{{k}}</li>
      <li class="note-item last" ></li>
      <li ref="placeholder" class="placeholder" style="display:none">Placeholder</li>
    </ul>
  </v-navigation-drawer>
</template>
<script>
/*
quiz mode
-> duplicate without type
-> store source canvas key for checking
-> dissallow delete or edit (localy), but allow move/save
-> correction mode -> send compare by id to server
	-> reply correct/false or only number of correct/false based on difficulty

-----
ok	-> auto open?
	-> highlight from search

-----
presentationMode
OK	-> drag and drop sort
OK	-> play order
	-> fix update delete
	-> display also VPC? auto open?
	-> status currentIndex/Length
	-> UI colors, types
	-> fullscreen transition
	-> keyboard shortcuts left, right, escape
	-> draw on screen https://github.com/szimek/signature_pad

	-> readonly public can playback

	-> second screen display/readonly
	-> show on click
	-> skip already shown by clicking manually
	-> paint order

-----

fix height if width max

fix search over vpc
fix if no zoom remove vpc
fix search x line return
fix search tag outside box
*/
import interact from 'interactjs';

export default {
  data() {
    return {
      x: 0,
      y: 0,
    };
  },
  mounted() {
    interact('.note-item', {
      context: this.$el,
    })
      .draggable({
        inertia: true,
        autoScroll: true,
        onstart: (event) => {
          this.x = event.target.offsetLeft;
          this.y = event.target.offsetTop;
          event.target.style.position = 'absolute';
          this.$refs.placeholder.style.display = 'block';
        },
        onmove: (event) => {
          this.x += event.dx;
          this.y += event.dy;
          event.target.style.left = `${this.x}px`;
          event.target.style.top = `${this.y}px`;
        },
        onend: (event) => {
          event.target.style.position = 'initial';
          this.$refs.placeholder.style.display = 'none';
        },
      })
      .dropzone({
        overlap: 0.1,
        ondragenter: (event) => {
          const draggableElement = event.relatedTarget;
          const dropzoneElement = event.target;
          dropzoneElement.parentNode.insertBefore(this.$refs.placeholder, dropzoneElement);
          // feedback the possibility of a drop
          dropzoneElement.classList.add('drop-target-sort');
          draggableElement.classList.add('can-drop');
        },
        ondragleave: (event) => {
          // remove the drop feedback style
          event.target.classList.remove('drop-target-sort');
          event.relatedTarget.classList.remove('can-drop');
        },
        ondrop: (event) => {
          event.relatedTarget.classList.remove('can-drop');
          const draggableElement = event.relatedTarget;
          const dropzoneElement = event.target;
          dropzoneElement.parentNode.insertBefore(draggableElement, this.$refs.placeholder);
          this.$refs.placeholder.style.display = 'none';
          const newList = [...document.getElementsByClassName('note-item')].map(d => d.getAttribute('data-key'));
          // remove last which is null
          newList.pop();
          this.$store.dispatch('setNotesPresentationOrder', newList);
        },
      });
  },
};
</script>

<style>
.placeholder{
  background-color: red;
}
.last {
  opacity: 0;
}
</style>
