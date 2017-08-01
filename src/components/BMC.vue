<template>
  <div ref="canvas" class="canvas" @click.prevent.stop="addNote($event)">
    <div class="paper elevation-10" id="paper">
      <zone id="c" label="Cost Structure" style="left: 0; top: 75%; width: 50%; height: 25%"></zone>
      <zone id="pn" label="Partner Network" style="left: 0; top:0; width: 20%; height: 75%"></zone>
      <zone id="ka" label="Key Activities" style="left: 20%; top:0; width: 20%; height: 37.5%"></zone>
      <zone id="kr" label="Key Resources" style="left: 20%; top:37.5%; width: 20%; height: 37.5%"></zone>
      <zone id="vp" label="Value Proposition" style="left: 40%; top:0; width: 20%; height: 75%"></zone>
      <zone id="cr" label="Customer Relationships" style="left: 60%; top:0; width: 20%; height: 37.5%"></zone>
      <zone id="dc" label="Distribution Channels" style="left: 60%; top:37.5%; width: 20%; height: 37.5%"></zone>
      <zone id="cs" label="Customer Segments" style="left: 80%; top:0; width: 20%; height: 75%"></zone>
      <zone id="r" label="Revenue Streams" style="left: 50%; top: 75%; width: 50%; height: 25%"></zone>
      <note v-for="(n, i) in notes" :value="n" :key="i"></note>
    </div>
  </div>
</template>

<script>
import Note from '@/components/Note';
import Zone from '@/components/Zone';

export default {
  name: 'bmc',
  components: {
    Note,
    Zone,
  },
};
</script>

<style scoped>
.canvas {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  display: flex;
  align-content: center;
  justify-content: center;
  flex-direction: column;
}

.paper {
  width: 80vw;
  height: 54.88vw;
  /* height:width ratio = 9/16 = .5625  */
  max-height: calc(100vh - 100px);
  max-width: calc(145.7vh - 100px);
  /* 16/9 = 1.778 */
  min-width: 1024px;
  min-height: 560px;
  margin: auto;
  position: relative;
  background-color: white;
}
</style>
