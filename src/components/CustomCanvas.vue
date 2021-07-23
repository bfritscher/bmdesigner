<template>
  <v-layout fluid fill-height>
    <div
      class="background"
      :class="{ presentation: showAsPresentation, print: showAsPrint }"
    >
      <v-progress-linear
        v-if="showAsPresentation && !showAsPrint"
        v-model="presentationProgress"
        height="4"
        class="ma-0"
      ></v-progress-linear>
      <image-zone
        :allow-click="false"
        @image-drop="addNote"
        class="canvas"
        @click.native.prevent.stop="addNote($event)"
      >
        <div ref="paper" class="paper elevation-10" data-none="bmc_tmp">
          <draw-surface
            v-if="$store.state.layout.showDrawSurface"
          ></draw-surface>
          <v-progress-linear
            transition="slide-y-transition"
            class="ma-0"
            v-if="isLoading"
            indeterminate
            style="z-index: 1"
          ></v-progress-linear>
          <zone
            dropzone-accept=".note"
            id="c"
            style="
              left: 25%;
              top: 25%;
              width: 50%;
              height: 50%;
              border-radius: 50%;
            "
          >
          </zone>
          <zone
            dropzone-accept=".note"
            id="vp"
            label="TEST ZONE"
            style="
              left: 0;
              top: 0;
              width: 50%;
              height: 50%;
              clip-path: polygon(
                9% 11%,
                51% 23%,
                60% 0%,
                100% 50%,
                60% 100%,
                37% 80%,
                0% 80%
              );
              background-color: red;
            "
          >
          </zone>
          <div>
            <note
              v-for="note in notesBMC"
              :value="note"
              :key="note.id"
              class="note"
              :parent="$refs.paper"
            ></note>
          </div>
        </div>
      </image-zone>
      <presentation-controls
        v-if="showAsPresentation && !showAsPrint"
      ></presentation-controls>
    </div>
  </v-layout>
</template>

<script>
import debounce from "lodash.debounce";
import Note from "@/components/Note";
import Zone from "@/components/Zone";
import ImageZone from "@/components/ImageZone";
import PresentationControls from "@/components/PresentationControls";
import DrawSurface from "@/components/DrawSurface";
import { db } from "@/utils/firebase";
import { totalOffset } from "@/utils";
import { mapGetters, mapState, mapActions } from "vuex";

let resizeHandler;

export default {
  name: "customCanvas",
  data() {
    return {
      isLoading: false,
      showAsPresentation: false,
      showAsPrint: false
    };
  },
  mounted() {
    if (resizeHandler) {
      window.removeEventListener("resize", resizeHandler);
    }
    resizeHandler = debounce(this.handleWindowResize, 300);
    window.addEventListener("resize", resizeHandler);
    this.fetchData();
  },
  beforeDestroy() {
    if (resizeHandler) {
      window.removeEventListener("resize", resizeHandler);
    }
    this.$store.dispatch("unbindCanvas");
  },
  computed: {
    ...mapGetters(["notesBMC", "canvasSettings"]),
    ...mapState({
      canvas: state => state.canvas
    }),
    presentationProgress() {
      if (!this.canvas || !this.canvas.notesPresentationOrder) {
        return 0;
      }
      return (
        ((this.canvas.notesPresentationOrder.indexOf(
          this.canvas.currentPresentationKey
        ) +
          1) *
          100) /
        this.canvas.notesPresentationOrder.length
      );
    },
    listMode() {
      return this.canvasSettings.listMode;
    }
  },
  watch: {
    listMode() {
      // triggers heigh calculations
      window.dispatchEvent(new Event("resize"));
    },
    // call again the method if the route changes
    $route: "fetchData",
    "$store.state.layout.presentation": function animatePresentation(val) {
      const crowdShortcut = document.getElementById("crowd-shortcut");
      if (val) {
        const offset = totalOffset(this.$el);
        this.$el.style.top = `${offset.top}px`;
        this.$el.style.left = `${offset.left}px`;
        this.$el.style.position = "absolute";
        if (crowdShortcut) {
          crowdShortcut.style.display = "none";
        }
        setTimeout(() => {
          this.showAsPresentation = true;
        }, 0);
      } else {
        this.showAsPresentation = false;
        setTimeout(() => {
          this.$el.style.top = "";
          this.$el.style.left = "";
          this.$el.style.position = "relative";
          if (crowdShortcut) {
            crowdShortcut.style.display = "block";
          }
        }, 500);
      }
    }
  },
  methods: {
    ...mapActions(["setCanvasRef"]),
    fetchData() {
      this.isLoading = true;
      this.setCanvasRef(db.child("projects").child(this.$route.params.id)).then(
        () => {
          this.isLoading = false;
          this.handleWindowResize();
        }
      );
    },
    handleWindowResize() {
      if (!this.$refs.paper) {
        return;
      }
      this.$el.style.setProperty(
        "--zoneLabelFontSize",
        `${this.$refs.paper.offsetHeight * 0.02}px`
      );
      this.$el.style.setProperty(
        "--zoneLabelIconFontSize",
        `${this.$refs.paper.offsetHeight * 0.03}px`
      );
    },
    addNote(e) {
      const offset = totalOffset(this.$refs.paper);
      const noteCenter = {
        x: this.$refs.paper.offsetWidth / 15,
        y: 20
      };
      const x = e.x - noteCenter.x - offset.left;
      const y = e.y - noteCenter.y - offset.top;

      const note = {
        left: x / (this.$refs.paper.offsetWidth / 100),
        top: y / (this.$refs.paper.offsetHeight / 100),
        listLeft: x / (this.$refs.paper.offsetWidth / 100),
        listTop: y / (this.$refs.paper.offsetHeight / 100),
        type: "bmc_tmp",
        colors: this.canvasSettings.lastUsedColors,
        image: e.image
      };

      if (e.target.classList.contains("zone")) {
        note.type = e.target.getAttribute("id");
      }
      // TODO #56: keep previous setting?
      if (e.image) {
        note.showAsSticky = false;
      }

      this.$store.dispatch("NOTE_CREATE", note);
    }
  },
  components: {
    ImageZone,
    Note,
    Zone,
    PresentationControls,
    DrawSurface
  }
};
</script>

<style scoped>
.background {
  flex: 1;
  position: relative;
  transition: all 0.5s ease;
  right: 0;
  bottom: 0;
}

.background.presentation {
  position: fixed;
  top: 60px !important;
  left: 0 !important;
  right: 0;
  bottom: 0;
  z-index: 3;
  background-color: #424242;
}

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
  overflow: auto;
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
  background-size: cover;
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAEaCAYAAAA/lAFyAAAgAElEQVR4XuxdBVhVyxb+AbFbr92N3WJ3KyZ2t2IQFhZioSKgqKigWNgBAnaA3Yli5zWwA0Xp960Fh4s8lHMOp8/M93x6Yc/smX9mzz8rZi0DiCIQEAgIBAQCAgE5EDCQo46oIhAQCAgEBAICAQgCEYtAICAQEAgIBORCQBCIXLCJSgIBgYBAQCAgCESsAYGAQEAgIBCQCwFBIHLBJioJBAQCAgGBgCAQsQYEAgIBgYBAQC4EBIHIBZuoJBAQCAgEBAKCQMQaEAgIBAQCAgG5EBAEIhdsopJAQCAgEBAISE0gnz5/jhVwCQQEAgIBgYDuI5AzRw6puEGqhwguQSC6v2jECAUCAgGBACEgCESsA4GAQEAgIBCQCwFBIHLBJioJBAQCAgGBgCAQsQYEAgIBgYBAQC4EBIHIBZuoJBAQCAgEBAKCQMQaEAgIBAQCAgG5EBAEIhdsopJAQCAgEBAICAIRa0AgIBAQCAgE5EJAEIhcsIlKAgGBgEBAICAIRKwBgYBAQCAgEJALAUEgcsEmKgkEBAICAYGAIBCxBgQCAgGBgEBALgQEgcgFm6gkEBAICAQEAmonkNjY34P3GhgYICwsjP/kzp1bphmitqi+pCT9b8nPY2Ji8OH9e+TMlQtp0qSR6R2J25b8O/E75WpMxkpJ+594nKGhoQgPD5cZu+S68Cf8ZOyueFwgIBDQUQTUSiA7tm1DYGDgb9Ca1qmDmNhYbNuyBYePH/+NEP42B8eOHIGPtzccFi1ClqxZ8fzZMyxeuBCjxoxBpcqVf6v67etXNG3YCF7bt8GkfHmZp9bIyAg2lpYI/f4diI1FoUKFMWjIYBQsVEjmtuSpEPrtG8y7dsPyVW7IlDEjFi1wgN0ceybElcuX48Sx49izz0eeprnO48ePsXPbdoSEvEGr1q3RsnVrpE2bVu72REWBgEBANxFQK4Hs9/PDhfPncfHCRcTGxqCOqSmqVq2Gb6HfsGXTZmzbvQuPHj5Erdq1YWxsjOjoaATdvIkfP36ges2ayJAhQ8KsvHn9Gt07d4GTiwtM69fDajc3eG3chINHjyD0Wyju37/HG3zpMmVAG3CjevWxdecObuPpk6do1qI5Xr98heA7d9CsZQvQ6Tv49m18/vwZNWvVQsZMmRLeRQTSvHETZMueHSblyuHatWv49OkTDh45jCuXLqNCpUp49Ogh6tarx9LA1StXkCVzZv45jePq5csgKYLqf/70GdVr1IBxWmN+54vnz/H40SNUrFQJ/+TJwwRK/b154wZy5cqF0mXL8nPHjxxFrTq1ccB/P5OGlY01atWpg1+/fuHN6zdo3rIFIiMjce3KFX4X4ZUuXTrG89XLlyhZqhRevHiB2rXrII3xf1LY7aAgDB88BEWLFUPValXht88XzZo3x5wF8/Hvixd4eP8BihUvjpKlSyEiPBwBJwJgWteUcStWogQyZ86Ci+fOoVrNGtxfGiv1qU7dujy2J48fo6yJCQoXLsx4fvnyBTeuXUOhwoVRomRJGBoa6uaXJkYlENBBBNRKIBI8Rw4dhuiYaLivW8cbiOfatVjjtgolSpVEyOs3KF6iBFZ7uGPk8OH4HvodefLmwYP7D7Bh86aEUz9tqoP7D0BERATWb9qIju3ao7ZpHfTp0wfTbachZ86cePjgAXr17YP+AwagYd162LprJ65dvoz16zxxNDAA+/38sWjBAhw/dRIWI0fy5l64aBHcDb4Lz40bEt7FBNKoMTqYmcFi/Djs9/XD7FmzsNHLC6OGD2eyyZEjBxwWL8KoYcORI2dO/Pz5E+nTp8fmrVsw1sICwUG3UaRo0QRV2pbt27BwgQOOHjnCmztt9AMHDUKXbl3RrXMX3sw/f/6CnDlzwH7uXJagqE8b12/A2bNn0aBhA3TsaIYrVy5jv/9+7PHxweCBA0EKPVLTff36lfHy2euNzRs38rvfvX3L2K7buIFxJ7KynmCJu8HB8PbzZcJ5+e+/THSPHz7C3NmzkT1HDjx8+BBDhw1DB7OOaNOiJfIXKAAjQ0O8ffuWSXns6DFo3KQxxo4fD7N27dGnXz/kL5Afa909WDqkeVi4eDHP4+ABA/ngQH0hUpm/aKEgER3caMSQdBMBzSCQYcMREx0Nd891vIkRgZD0cCTgBPbu3o1lzi5YuWY1n4wnWFkhjbEx1q9bh45mZhg7YXzCzNBp3H7WLCxbsRyW48Zj/eZNKFGiBC5dvMSnba/4jXOJi/NvBOK5bh2OBQaCJKKF8xdg7XpPDOzXH6MtLJAxU0Zs2rARVatXw3wHB36XRAL5/PkTDHiLBsqULQvnZUvRpaMZJttOhVnnzphoacWbpbe/H36GhfFmO3HqFPj7+iL8Vzg2bfHCAyK17uZY7rYSUydPYUmim7k5kwmp5Ygkepn34FN/zVo10b5DB+TPn58JhDZrQwNDDB4wADv27GaCW7JoEfz9/DFqzGi4uizFsZOBvCG3atoM3Xv24Of3+fhg/+FD2Oa1BZs2bsSBI4eZLOi5gX37sTS4fvNmnguJHYSkiIvnz+PF8xfYuH49ihQrBsclS9C6ZUts3uKFPHnzomXTZkzely9dxnpPTyxxdoLV+AnwP3SQyfPSxYs8D+vXrkOrNq3RwawTRg4dylJVrVq1mJBIChFFICAQ0A4ENJZASIVFm5/33r1wWrgIrqvcMHr4CCxc4oisWbPi86dPvGmTqkVSwn78QMtmzZEvXz5Wm/ge2I8Fc+fiwrnzLA24Ll3Gm//vBHKFCYs2UbK70Cl5tYcHhg4ahLkL5iNX7tz48vkzChcpgrLlyv1HII0ao0bNmjDv1ZPtEKQa+/zlC8zatoOTizNM69eH7ZQpuHb5CnwPHsD30FB0at8B02bOwN49exD69Ru8dmxH0K1bGDZoMEsBEyzGYuTo0ejdry/m2tvj7OkzLAncCbqNd+/fwddnHxPSPn+/3whkUP/+TCYkVTgtXswEMn7CBDguWoSDx47C0MAA7Vu34XZjo2Pg5+sLv0MHQTYokr4kBEKEQQTkvWcv24cKFCyINW5uLHXcunmTpb75Cx0wd7Y9MmXODEenJWjdoiV8/HxZ6mrRuAkTHqneaKzUH5orInKSSkjKmDNvLqZMmow6pnVgM3kyrl+9infv3rFk9OzpUz40kJpPnYVUpSQBp02XLv54QKauWFahEkYGhgaIjYlFZGQEsmbN9pud7vv37//1n84WsXF1iUATigFQoUJFlDMph7Tp0sLAwJDfYyDUd+qcdvFuORDQEAIZxh+nh6dnnATi4YEtXltwLDAA3nv2YMliRwSePoVxFha4f/cesmXPhm/fQuG81AXVatRIGDZ9qGNGjsSVy1fQr38/TLC25g1w86bNMDEx4Q3sW2go3FavQu8ePbFt105ERUVhxJChvNHBwAA/vn9nFZbluHG8cZPqi+osWuLIthiJBNKsUROYdTLDOMsJCe//+OEDq2yclrrAtF49Vk+RJBMVFcm2kJIlS2H1Wg+MHjGC1WKZs2TBj9BQJiaSvtxXr8bmjZuQO1cufPz0CVNsbVGqdCmMtxjL9oSwsB/In78AEyBJIFt2bEexYsWYHIgYe/buhU+fPmO/vz+f+mlcISEh/Duy9Xhu2ogdW7fGEcjB/ycQGgiNf+yYMXhw7z7SZ8jAfZ+3YAGuXbuOPbt2oWzZsqyq+vbtG1auXoVB/fozyf1HIBtRpVpVDBs8BLdu3MCKVW5s/7CfZYcTx46hVJnSbKOhMmasBZyXLEG+/Pnx9fMXFC9eHMvcVnJ/VV3ITkRrkJwi6G9SJTZs1IglM1pX9IeeyZgxUwKJkFRJ0qDEbkP+hETwRKCSwjas0FAUTuJgcfjwYV5P1GYcycTwv2k90t/kSCKRCund9A55PQZVjaV4n/4goBEEcvfOHf5oK8Z7S5He/c2bN/yBhbwJwbNnz9hQSx/S0ydPWPooX6ECMmTM+H8z9fnjJzaYV6pSBZkyZeI6ZJSm9mkzvnXzFkqXLs0n6irVqvEztMlSmzlz5OB31TY15XbpRPzh/QeYlDfhzT7xpkDqmLx58/IpW1IiIyLYoE6EkD17dv5xVGQk7ty5gwzpM/DmSRvK8CFDkMYoDWbYzWLppnzFigmb0If37/Dk8ROUMzFB1mzZuA2y69y/dw8ZM2ZklVx0TAwuX7yIKlWr8sb99csXVoVVrlIFr/59CSKyWqZ1eOz37t7lTalC/DvIEE5ESkZ1si+9fPWSJanExuvEONOcSDZRMqDT6ZvUaUE3bqJMubIICgpCterVeXMjTCpVqsR2Dpq/f58/57aN0qRh/IODg5EtSxbkzZ+fnSEI/+ioaDy4f4+lHJLyFOkSLXERlxBAdFRUnCQRE4PYmBgYGhnx31wMDZEhfXp+P83ZiePH0apNm//mNjKS54HWi6SQxJuYQEj6+PjxY8K80XMSJwiJ04Ck7qHDh1GnTh2pdhqJ9PPr508+5BDBksqXMCfSIgmT1LqS97FSNZE7u1QvEQ8JBORAQCMIRI5+a20V2gymTJwII0MjODgu1tpxaELHJcRAfaF/k9cZeYYROUdFR7EqydDQCIaGBkyQRBjSEBQRbsDx4+y+nHA4iIwEHRASe+MlJhAiSFKbfvjwQeEEIg3WNHZSqxEONHaSpKiQNJM2bTr28mNeEaoyaeAUz0iJgCAQKYFS5GOSTSzpJUpFvkPb2yKMWKUTGcnqHCYL+u/oaD5xU6ETuHGi+yn8cwWcvOUhkO8/fiBzpkx4/vy5Wgjkb/MtIVqJGo6kl4jISCYTljwNDJhsCW8mXVIhJrngq+3rSfRfOQgIAlEOrqLVPyCQeDOjR0itJDFO078NjdIwB5CayZgIglQziUhBGgkiteAnSyAREayWS5c2bZyx28AAv8LC+JIq9YnUW6Tqu3//Pr9ecjig39EYSPWYuMiiwkrteFKqn/ggQ+Mgoo6JiWXXbJJmyMgfJ8H9Z4eRzIMq5iOl/ovfqw8BQSDqw14n38xG4fhCGxNtSKRWIr29xM6SmBRIiqCfa5I09icJhAgusd2NVFgSjz9yUqDNlNyUJbYrCQ7JGdE1iUCkXYisHiMjP0mD0dFMMjEx9HcMzyHZ6LiQp1r8H2nbFs9pJwKCQLRz3tTSa9oUSFrgTYQ8lkjHHh3DAgJp3OP07WnZaC4pkguKaumwnC/9E4H8yYhOHnaSqAiaqMKSEwaZq0kkSSaayCh2c5YQCR0gIqOikNY4LUsydIjQpEODzIMVFRgBQSBiIfz3IZOrKn/8kUwSfD+BbRHRMDJKw8+lSWOUQBC6qsZIjkAIEyKQpEb0zJkzswu4BAt9JpC/fUpJPeLI6E+XcONIJ85bTfIM2bVIfSZRXQo1meZuUoJANHduFNazBG8lUj0YGCD85y9ER8fZHuhkyB9svIcSfczkuaTPH620EgjdmaEwNXSRVFKSJZBk7oFoowpLYQsyhYZoXSa2ldF9GyITcpKgdUr3k9jITz8Tly9VNS3JvkcQiFrhV9zLWWqgDy+GVEqGfAFQ8nFJSELyNqGf/jvutIFRBISGDRsmPCi5aEjkGh1FnmHA9++hHD5GcnqmDY5u1WdJcmeIbCUUKTlBrWdkhBvXr6NmzVowMjJkiU5shNJ9C0ldt0lVFhERzhjGrX0iFSPGlbzJ1HEpVbqR6MZTgkA0dB4TfyjURbpjwB8InbjYxT/uBCaRHBKH/9Bn6UGe6UyKNUcjOEb3QFpx7DAiY7qoR5t8YmeAiPAIpEufjtV9NDf0TPivX3En5ESFTtCJje/UxoVz5zh68n+uteSiHMXvoMuVdHeF1Insqpz4kqAC3JTlwUhb6iS2q9BBgGx0JG3TJxMfWSZurpK6gAtJRq4pFgQiF2yprxR3r4FsDjFxt6OjongjokJ/04YjOT2xv76Ul+BS3zPda0GCdSziL9pFUriQaFbh0SZNcap+O6nGxsZdJEx0Ez0pKkTo5LbLN9fjCYSklHSJY17FV6KwLxwqJ77Qu86fO4faUtxE57AmHO6Eeg+QNEPvlHivEWmxRAkDNk6LIh0CCbjGP07EL/EgJMKOOyjEqXIp+oI4lCWPqyAQ6dabzE+xyiOeEOhOA52Efv36CWPjOHsDGaMTwk+I28Ey45u4goSA49xM6fRuyHHDCGcy/qdNa/yf4V8KrIkQKG5X4pvoSd+XWNKg54mMaL4TG9kldX58/4FMmf8LgUL9u3jhglQEkhIwdJomYqGxkzcY/TcZqNOkMeZAjbQO49Yb3a/5L1tnSu3q++8lIW4I2zinEjpwxIXCoW9YEt2ANAISLYA+YiYIRIZZTyweS+44cAA+KvEB72hBSWwMdJIRH60MACd59Dd1RBTdno6I89qJD6lPj0tuTZMjgKJsO7Tp3rx+I8FDKO5Sdly6ZPonqaRIakmInsv3XSI5XAjPd7yBV7Jdh4X9RIaMv6u1SpQoiZy5csoPjpQ1JRhSGBaStvjSY3hEnIosnlxIapLYYEQcLSmBjSftOJfluGgJhB1Lo/HxySQSaWKC0bX9QBBIovWSWKyVqA1oY6BIqZL7DJzalVUGQq0k/aeW/JMsOXAE3DgFNW9yZJ2OVzXxSY+MofEhSjTFIErSR2JVFY3j189f/0cSklFTErTMWTKnFi6l1GcbjOROD0ckJgkmgsmRvZ7SpGGXWt746L8TudcqpUM61qhkT2FJMTYWYWFhfFeK1jllAqW4bbT244z/8ThrEQZ6RSASTxrJqYxODiTu0yZG+mz6WCR6bS2aQ43uqkS9w6f3mBhQxFr6gCQG6aQGZ40eDDkz/CTyiLN9SApFySVC+dPpUpMJRBa86Tsh8qS/6buhy5MkARLREO3z4UoUuRCIO4T8ZElGErmBc8jErzNNDeev9QTCZMD/i8vXIDFosh443nNGEiqDPnDhrSTX+v6tUmKvpbhYVnEeRFRoW+UAh/FG36RqPG0W4fkE+YPsGb9LE/Th/40Ik9pAUj8DmtNC4guCfDkwfsOjwxkRTZztxZBP23zKNqALgnEnblH+jgBhK3ERJzwlti5Cji61Er5E2iQtSr4zRalxpZ0bjScQidQgWW60SCXeEizyxYt9LGaT2K2FYqC0k6Wq55JiTvncSX0Ur9pnIyLfTo+/v6AvdxjIvTcpeRA2ksRPf5qf5Oqpai414T0SVaXEZZm8D8kgTetGEv6Gvl2SUMWdGNlnLLGajBx2qJAruISj2WMvUZK2NPRvBRG4WglEcgohANh7JD7hD4twFE+J/eCNkT5DonSgsuMraiSDAGMeb4NICF0S/xFTUDyJh5gALw4B9nJKYvugnye945EcXsndDRG4Jo8AnayJlCW3ziWh5v+LlCAkl9SsHZJaJDf76d8U8ZrtXPGXLiV7cmIHlr+9T20EQoyYNXPmBFE2cYeFeJuaJSJd3aQLRGCesjrh67dvvwUAJGlYYsv5W+20xsa/ZTKUbobEUxLipr/F+lTeepCoyiRvoMMlrXVpiloJhNKbiiIQ0AoEYmPxJQmBSGscFwSiFTMsOhmPgFYSyOfPn/m27o+wMM7sRsZw8njJmjVLgvFIomuntKGUB7xosWL/Z/OQ+LZLchTQ33R6efjoEXLlyMFGvbTp0iXorSW/Fycc8f38DQE6pSWWQEjtJ7lElhJyiQmEVDT/vvgXRYsVjctpHp9tkdYf5VPPnTt3Qn4NydqkZyT2AolRlf6bbriTW2jevHm5naTPSPol+Xni33/58hXZsmUVMbhSmjw9/L1WEsi6tWtRsmQphEeE48H9+2jWvDnuBgejXv36nKSHfkYB6Tp06ICVK1bAtG5d+PrsQ+UqlTkPNentSaVgnMYYpvXq4mRgILf39OkTFClSBO/fv8ed23fQqnVrvhH+NuQtGjVpjAP79+Off/Kgu3l3PVwqYsiyIPDl69cEFda3r1//L3HUn9qSEAjpnJe7uqJ7d3N8/PQR//zzDy5dvIiQkBBUrFQJp0+eRNNmzXDv7j00bNwImzZuBIWLp+CMtIbpucJFirArdKdOnTBntj26dOuK169e49u3r6hQsSJu3byFf1+84FvoZEjNnj0bKletivt376J8hYoICDjB2REvX7oMKxtr5MmTRxYIxLN6gIBWEshqNzfk/ucfPH3yhI1oJhUq4HZQEBNItqxZcfHiRRQvXhxmnTrBxdkZ1WvUQPCdO+jVuzeuXr2Kx48e4f279+hm3p3/Xb58eQQGBqJI0aJ4cO8eR02l8v7dO0RGRjHJfPr4EeXKmeD8+XPobm6uB0tDDDE1CEgIhHOl0G34RImz/tauhEAo1MgGT0+0bNUKL1+9QoH8+REUdBsZM2Zg1+dMmTLh5o0bqFu3Ll69fo0qVarwug/9FooTx4+hQYOG+PD+PSZNncJSyt27d+Hv68sEUqtObf4ZxdcKPBGAwkUK4/WrV0weVy9fRrYc2WEQa4CmzZvhwvkLHPakV5/eCfnlU4OLqKtbCGglgTx79gz58+fHw4cPQR8cXcxKly49Pn36CBMTEwQFBaFkyZL8kZE0Qae3Vy9fIn/Bgrh/7x6yZM2KSxcu8LOly5TBnTt3ULZsWTx6+BD58udnf2mSZOhvSkP677//okCBAnzC+/TpM/LmFScx3foMFDuaxCosWd1yE6uwaO1SyPdixYvj0YMHrIaltViqVClQLpGCBQvi339folChgix5fPjwEeHhcYEbv375ypIFSSPUH8q/Ts/Q7968fo2IyEicCjyJjp3MkCtnTnwitXC2bKwSpmcLFCyI7NmysQTz+vVr/lY05Xa/YmdLtJYaBLSSQFIzYEndpN4EimhTtCEQkCBAEgh9XBRyhexo0hZVGdEl9ywEKUg7M+K55BDQWwIRy0EgoEwEiEBCv31DZhm9B1VFIMocu2hbfxAQBKI/cy1GqiIE6HRPKiHyvpJF+qDuCQJR0SSJ1ygEAUEgCoFRNCIQ+A8BIpDXb96wt5+sRRCIrIiJ59WJgCAQdaIv3q2TCNBHRRKIPPYFQSA6uSR0dlBaQSCEvr4E4dPZlaZnA5ME8ZRn2GKty4OaqKMuBKRd62oLZaIuYMR7BQICAYGAQEAxCAgCUQyOohWBgEBAIKB3CAgC0bspFwMWCAgEBAKKQUAQiGJwFK0IBAQCAgG9Q0AQiN5NuRiwQEAgIBBQDAKCQBSDo2hFICAQEAjoHQKCQPRuysWABQICAYGAYhBQK4GIJE6KmUTRivIQkDY3tPJ6IFpOikBK+0YsVYjl/xdFyQiojUBC3rzBHLvZiOV8g6IIBDQPgdiYWFjaWKOciYnmdU5He0RJtygxHOUr+fjhI16/esnpGyhpHCXxojTCv8J/4devX4iKjEJ0TDQjYWhgyDlVjI3TIGOGjMicJTOyZsnKSegoz1CBggU4cyOlc6DnKBukKKlHQG0E8uzJU/QyN+fb6JTeEwaUokcUgYAmIGCAqMgIPHnyFKvc13CSJlEUiwB97ZS/hEjh5cuXuHj+Am7cuM5JsCjvyY8fPzitNUkbtOmnS5+Og1imTWOMNMbGnMyL9g7D+G0jJgaIiY1BTFQUoqKjEBEZhYjwcP5DZMQpro2MkDFDBmTLnp1TB1etVpXntmSp0siWPRvSp0+fkHFSsaPV3dbUSiA9zc05lSwtEDt7e14soggENAEBSgvbpGEjuAkCUdh0ECE8fPAAp0+dYsKgzKG/wsM5wjFJBZRMq3TZMihXrhxKlS6NokWLolChQrw/UAwyJgxD+tuA94rk9gsiCkleFPq3RKKhdMCUsIveSX/uBN1m4iKiImmEknJRwq06dU3RoEEDVKxcmQNnChXm36dfrQRCEsjWHTvw6tVLXLt6FTPt7OQKVqewFS4aEgjEIyAIJPVLgQjj06dPnHb39MlTePLkCcJ//WLpgfKyN27SBNVrVOcMopRh1JgkCyMjlRwkJcTy+fNnTqN9/dp1nD17FkE3byIiIoJJpUjRIqhTty7ad+jAZEYkJ8rvCKidQLbt3MmLyM/XF5cuXcJse3tBImKVqh0BQSDyTQGRBqWn9t/nixPHjuHt27e88ZYsGUcYHczMOJU0peLVxEK2FZJWAo6fwMED+3H//gNQCuMcOXPCtK4pupmbs4REKbdFATSGQGgyjh09iv3+/nB0chJGLrE61YqAIBDp4Sc1z4f377Fn127s2b2b7RqkdqpVpzaGDB2KmjVrIn2GDCqRLKTvdcpP0rhIGrl37x42rN+AkwEBnJGSxtKiZUv07d8PxUuU0Ouo4hpFIDSl586dw55du5hERAjslBe5eEI5CAgCSRlXUgMFHD+O9es82a5ANokGjRph+IgRqFylMhuldcmuSd5hZMPZtmUr9uzZw7ab/AUKwLxnD5ZMaLz6VjSOQGgCTgYGwsfbB4scF/NJRhSBgKoREASSPOJ0Kv/44QNLG9579+Lzp08oVaYMBgwcgFatWyNHjhw6RRp/Wneh37/j8qVLWLvGHTeuX2cPseYtWqD/oIEoXLiw3hx+NZJAaNKuXr2KVW5uWOnmxh4SoggEVImAIJD/R/vd27dYvdIN/n5+bAivV78+Zs+xR5EiRVQ5NRr3rq9fv2L+3Hk4fPAge3WR6s5m0iSUKFlS58lUYwmEVklQUBBWrXSD64rlwiaicZ+NbndIEMh/8/s2JASOixbh7JmzfJjr3bcPhgwbhn9y59b5DVKWVf79+3f47tsH16XL8PHjR1SoUAG2M6azl5kuqfISY6LRBEIdvXb1GlauWIFly12ROXNmWeZTPCsQkBsBvSeQ2Fi8e/ce7qtX4fDBQ2w4HjhoEPr268u3u0X5MwJhYWHw8/PDqhUrEPImBKamphg7YTxKlCqlc0Si8QRC0/To0SPMtZ+DVWtW8+UeUQQCykZAnwmEjMXbt27D8qVL+W5GvwEDMNl2KtIYGSkbdp1rf9PGjXBxcmbPtK7m3TF+wgRk1lAXZnnA1woCoYE9uH8fi5l2Hj4AACAASURBVBYuwspVbnrp7SDP5Io68iOgjwRCBvKzZ87AYe48vgDYvmNH2E6fhly5cuncyVn+lSF7TZJIPNw94LF6NduORo0Zw55bdGlS24vWEEgciTzA9Gm2cF+7lr09RBEIKAsBfSOQ9+/eY669PS6cO4dKlSth7vz5qFCxorLg1ct2X79+DftZdjhx/DhKlioFuzn2MDEx0epwslpFILTq3rx5g+lTbeG8bCmyZ8+ulwtRDFr5COgLgVC8KDL8Oi5cxOoqkjh69OypN26oyl9Jv7+BpLxzZ89i6qTJePv2HfoN6IeRo0ezG7A2Fq0jEAL5xYsXmGwzEWvWeiBbtmzaiLvos4YjoA8E8uXTZ0yeOJHvMTRq0hhLnJ2FZK+idUkhU1ycnPgSZqHCheHo7ISSJUtqnTSilQQikUQsx0+A63JX5M2XT0XTLl6jLwjoMoGQS2ngiROYPcuOQ6Y7LF6EDh06CDuHGhb3zRs3Mc5iDN69fYfRFhZ8EVGbXH61lkBorinRzLQpUzDPwYGTxYgiEFAUArpKIL9+/sQKV1fs2rETNWrVwlLXZeLbUdSikbMduj9CZO7r48Ph5OfMm4fsWmLj1WoCofmicMw9u5tjy/ZtHBJaFIGAIhDQRQIJ+/EDA/v1x9OnT9mddNyE8cLWoYjFoqA2Dh08CMtx49nL1HPTRg7UqOlF6wmEAP7y9Susx0+Anf1sFC1WTNMxF/3TAgR0jUBu3riBiZZWnPlzudtKvtymTaoSLVgyCukikfuwwYMREvIWU22nor2ZmUbPk04QSJwk8gWTbKw5syEFMxNFIJAaBHSFQMjrZ7+vHxzmz0eRYkWxbv16zvwniuYiQPG0bCytcOLECb75P2bsWE7jq4lFZwiEwP0RFobunbtg5epVnPFMFIGAvAjoAoGQiy5dXlvr7oH6DRrAw3OdiG4t74JQcT2aO8dFi+GxZg3qN2yAJS4uGhkPUKcIhOaYbn1aTbDEBMsJKF+hgoqnXbxOVxDQdgKhXB3z7OfggL8/+g8ciKnTbPmehyjagwBJj7t27oTdzFkoU6YMXFeuQFYNu7agcwQiIZEJ48bBytoG5SuU154VI3qqMQhoM4FQLKupkybh7OkzmDhlMoYNH67RenSNmXQN7cjJkycxZuQoFCpYEO6e6zSKRHSSQGgd/AoPx+jhI2BpbYUqVatq6NIQ3dJUBLSVQMLDwzF21GgE3brF9zu6dO0qyENTF5kM/Qq+cwe9e/ZC1qxZsdFrM+do14SiswRC4FI+Y7qx3n/gANSoWVMT8BZ90BIEtJFAaL2PG2OBWzdvYulyV7Ru3VqQh5ast5S6SXM7sH9/BN8JRuZMmbDBazNya8C1BZ0mEAmJTLSyRs/evdiQKIpAQBoEtI1A6EY53SG4duUKXJa7ok2bNtIMUzyjBQiQV9bI4cNhO206jNMao1d3c2TLng2bt25FJjXnSNJ5AqH1QTrhaVNt0a5DezRt2lQLlozooroR0CYCIfKYPnkKTp8+jUVLHGHWqZO64RPvVxACdEudDgZTp09DqVKluNV79+6hd4+eyJ4tGzZs8WK1lrqKXhAIgUteKdOmTEWbdm3RtFkzdeEt3qslCGgLgZCnzoI5c+G9dy8WOy1Bt+7dtQRh0c2UECB7Vt9eveG01AVFixb97fGbN2+iW+cunDbXY72n2jzs9IZACH06qc2bMxe1TeugXbt2Kc2f+L0eI6AtBLLOwwPuq1bDysYaI8eMgaGBgR7Pmu4MnUI0kT1rzvx5yd5po4PDmdNnMHLYMDRo2AALHZfAwFD1c69XBCKRRBbMnYeKlSujS9cuurPixEgUioA2EEjAsWOwnTIVXbt3x4KFDsJgrtAVoL7Gvn79CrqGQEm9UoqqscXLC/Yz7dCnfz+Mt5wAA0NDlXZc7wiE0CX2dly0CCVLlkI3cyHyq3TFacnLNJ1AHj54iL69eqFuvbrYsGmTCIqoJesqpW7++P4D/fr2xWr3NVJFSaa9bPGiRVizajXmzp+Hdh06pPQKhf5eLwlEIoksdXZB3nx50bdfP3F6i19WpOajXM36HmhPkwnky5cvGNCnLwwNDeDj56eRSaBoY6M/hio+ESt0d1RxYyEhIZhkbYOFixejYCHp45WFR0RgxJChuH79OjzWrUOZcmVV1nO9JRCJJLLUxQXZsmXH4CGD9WrTPHrkCE6fOoW69eqhTbt2+PrlC3tzXLt6FdWqV2d7Ef3JlCkTL8Z/X/yL9Z6eyJY9O4aPGMGbFxEN+aenS5eO4/TQxpYlSxbcu3sXP3/+5HYotAyFp6aNhBwZqPwMC+PbtJpMUppKIDEx0Rg5bATu372L/YcPoUiRIirbLJJ70a2bt7B3z26UKFkK/fr3Q2hoKK+Zb6Gh+PjhA6tgyBhMmUMpCx+tAcmaUmvHNezlb9++ZW8ripScO3dumXtHGLdr3RrktbVr715kUZFnll4TiIREPNa484SNGDVS5onTxgr0ke/csRNDhg7Bt2/feOMPDg7GhXPnULlKFTRr3hyOixczGVhaWTEB0MmIXETJJfrxo8c4dvQITOvWRdCtILx8+RIDBg7E4yePcfniRdSoUQNvQkJQslQpPH70CMHBdzFg0ED4enujaNFiSJ8+HaJiYtCzZ0+NhU8TCYRO9O4UHHGNO1asckObtm3Vih+RwXRbW8x3cADdVYiOicG5M2fh7+vLbqePHj7E1i1b0bBhQw4p5L3XGzVr1kSHTmZIlzatWvuuSS9/9+4dxluMxSr3NamSJu/fvw+zdu1Rx9SU7wKpQvrTewKhhUSRLzdu2IDvod8xdvw4jT4ZK2LhE4FQkLaGjRph0/r1qFWnDi+2A/v3o1mz5mjWojluB91GbGwMKlepjOzZc2DSxIlY4ODAp8nnz56z6u/QwUOIjYmTKgoWLsxSR+CJACbiiPBwFqk7dOwIknYo2VeJkiWRPXt2DlN95uQpLHFx1lisNZFArl65wuF5+vTrx7lvVLFB/G29xRHINP5mfPZ6o2ixorwG/P38MWfeXDx8+BBfP39Bg8aNcP7sWQ6/ceXyZZZgSSIRBXz4mmRjgxUrVyKXHJJHUgx9vL35sEdeeb379VM6xIJA4iGm090Wry149zYEltbWav84lT3zdOnsZEAAatWuzfkhjh45isioSJiYmKBxkyZ4/uwZYgEUL16cJZE3b95g4/r1TCYtW7fCP7TYDQywbu1a/lnNWjVx5PBhxETHoE+/vtjg6ckbnfeevcj9T240b9GCQ4kTeXnv2YMSpUqhSxfN9YLTNAIh9Y95l64svfkdPIgM6dMre4lI1f7du3f5DgqtkwYNG/LBhNSZNN+RERH49i0UFStVZAk36OZNREXHYMTIEaz21Pfy7NkzzJ45C8tWLFcYodI+Nnb0GAQGBmLH7l0oWKiQUmEWBJIE3h3bt+PFixewtrFhHb8o+omAJhEIbQrTJk/BmTNn4LvfX+S60YEl+fz5c8ywnQa3Nav5gKbIQoe0dq3b8CF4x+7dSJdeeWQtCCTJzNHH6u/nh6tXr8Ju9myNVbEocsGJtv4fAU0ikHNnz8Jy7DhMmjJFb+x0urwmKW3tRGsbbNy8CZmVFMvq7Jkz6N+nL0aPtcDwkSPZI04ZRRBIMqgyifj74/LFS5g1204jM4EpYzGINv9DQFMI5NvXb+hlbo6cOXNgj48POzSIor0IkKF7mYsLHJ2clOqNRnbdSTYTcfjgQWzethXFihdXCmiCQP4CKxl7A44fx6zZs9UWa0Ypsy4aTREBTSGQRfMXwHffPhwNOCFymac4a5r9ALm3z5s7F+5r1yJjxoxK7yy54Teu3wA5c+Xi8O/KcLoQBJLCNJ45fZoNwY7OTkqZAKWvIjlfQFLYk8ePUbRYMb2UwDSBQKgPPbp1x6DBgzklraYXOvV+/vSJva1os6I19Onjx4T/1vT+K7N/t27dgsuSJVjt4aFSBwLyrBxnMRaLHB3RvGULhQ9REIgUkJJHwz5vHzgsWqg3KgS671G6dGmcOXuWU2nqW1E3gRD+A/v2w/fQUBw6dlSp6g5Fze0+Hx+Y9+iBI0eOoEmTJrhw4QIaNGiANatWYejw4Yp6jda1Q67LXps2c4bIDBkyqLT/5Grdr09f3AkKgu+BA5xHRJFFEIiUaEoWAYXMJndUXS8SAqlTuzY2e3npxZgTz6m6CYRcrCkRGmUWpLs02lA+fvyImTNmYN68eaw2IW+giRMnYvqMGShSuLA2DEHhfbxw/jxWua2C+1rVSh6JB/L48WP2yqLLvGPGjlXoGAWByADnlStXOHT2ytWrdN4mEhkVhdKlSmHp0qUwMzPTK/UdLQl1EgiRt3nXrjBOY4xDR4/opQpRhs9SYx+lUEF0sY/UR3Q3Rp3FaoIlX+jdf+gQsmZTXAIqQSAyzuqNGzewzNkZK1at0gq1gozDS3hcIoGcP38e+fPnl7oZun1Mt4zz5MkjdR1NfFCdBLJ7504sWeyI3Xv3olLlSpoIz//16dy5c7h3916yMeW2bt3KcdY6qDhSrDqBCzhxAseOHeOrAJqgsSBpsGG9+qhduzYWLnFU2PUEQSByrDLypnBd5gonF2eV6zTl6K5cVSQEUqxoMRw5euSvH8Gd27fhtMQJhw4fwrv373E3OBily5SR672aUkldBEKhQLqadeL0pV7btmoKHCn2g0JylDcxweHDhzlAp6RQ+tW6desiICAAVatWTbEdXXjg8MFDOH78GOYvXAhjNUseifFcuMCBA6Lu8fFW2A11QSByrti79+5hpu00bPTarJOSiESFtXnTJg5RkThyLgXOmzplCpycnZlYKMxGhfIV8Oz5M9Z133/wQCNOXXJOLVdTF4HQJda5drOxy3svqlSpkpohqLzuOo+1GDdhPMw6mqFG9eoIvhuMLVu3YsH8+bCZOFFhp16VD0yGFx46eBB0ic9+7lyNU/tSlsMGpnXRtEVzzJk3TyHzIQhEhsWR9FEKRzBr+gwOwazOxPapGMIfq0oI5PyFC8ifL1/CcxSevVnTZrh0+RJatWoFb29vjB07Fhs3bkTJ4iVQu06c0V3bizoIhKSPDm3aoniJ4qy+0uRw93+aX1Jhuq1YiafPnvK9lTFjxqB8hQpaORZZ17CPtw9u3riO6TNnqt3m8ae+U5Rtiubss98f+RJ917KOVfK8IBB5kYuv9+jxYzg6LISjizOyKjimTSq7lqrqEgLJlDEjrl2/zr7rlGqzTes2CLodBMsJE+C4ZAny5smL129ew27mTA61QRuvtquv1CWBHDpwAHYzZ2HX3j1aJ32karHpQGUKIvno4SNMnjpFo2PoUeoGulzYtn17TFHA3SJBIApYvKT/pYxgXtu3IWfOnApoUf1NSGwgBw4c4Ai9ZISjXA4UQXS/vz9atmqFnTt2oE/fvli4YAFsJk3SqVOmqiUQunTXs2s3GBkb48Chgxqn/lD/itTMHtC87d2zh3PkTJoyWSu+AUmIk4NHjyJjptTdiBcEoqB1ST7wNpZWcHZdhpw5ciioVfU1k1iFRRnS6tUxxe3gO5wzpGmzZgkdo4RRlOdDG9Utf0NX1QRC4fN7duvO9z7atmunvokXb5YJAcoj9OnTJ4yfMEGjJY/Eg3r2/DnaNG8BSxtr9OzdW6bxJn1YEEiq4Pu9MkkitlOmcKA0RegXFdg1mZuSEEh0VDQePnqIkwGByJwlM+o3aCBzW9pYQZUEQiFAhg8Zgrchb3HyzGmN1Z9r4zwqq88keazz8GAHEotx2pWEjvret1dvPHr0kG+npyY3iyAQBa8w8nQY0KcvPNZ7ajWJRERGokzp0jh+/ARKliyhYJQ0vzlVEsjXL1/RpkULDB0+jO1Iomg2ArQBr1+7DuGRERg1erRWSt/Hjx/HqGHDsW7DelRKhbefIBAlrFXaECaMH885xPNq6YU6iQRCxvJcOXNx2l8uBnF/0c3aqMgoGBgagFIX0keVxjgNDAwMYd7DXOtv6quSQLZt2YKlTs44FhiAIkWKKGFFiiYVhQCtc7cVK5AhY0YOcqmMCLeK6uvf2gn7+RMNTeuiWo3qcHR2lvuVgkDkhu7vFUkSGTxgIFxcl3G6T20r0TExmGNvj9CvXzm1LfFGzF+S0tCvDAyA9BkyYPbs2VofdFJVBEIbUo8uXRFrABw5dkxr9Ojatp4V0V86RLk4OSFP3rzoP2CAIppUaxuzZ9mxAwClCpD3trwgECVOId2ZGDlsOGbPsUfJUqWU+CbRtKIRUBWBPHvyBL179IS75zo0atRI0cMQ7SkIASKPpc4uKFioIEcc1lbJIzEcb968QbNGjTHdbhbayxlmRhCIghbYn5qhW9ujho/APIcFKFq0qJLfJppXFAKqIpCVy1yxfft2XLh8SWnpTRWFib62Q+SxYN58lCpdCr1S6bWkSRhSqPdWzVsgV+7cWLPWQ66uCQKRCzbZKhGJDB08GDNmzkTFStoRHE+2Eere06ogENqYunY043SjGzZv0kpjrO7N/O8jok3W3m42qlWvhi5du+rccF2cnLHW3R0Hjx5BlqyyR+kVBKKiJREeHg5rSyuMGDVS3DJWEeapeY0qCITynbdp2ZIjtvbqkzp//NSMVdRNHgGWPObP5yCQpOLRtbtONOrgO8Ho1KEDXN1WwrRuXZmXgiAQmSGTvwLd7h4yaBCmTLVFxUoV5W9I1FQ6AqogkK1eXljmshTnLl4AXdYURXMQIOcGq/ET0N6sI1q2bKk5HVNwTyhvep2atVC+fHkmEVmLIBBZEUvl8ySJ0I31Xn36oEFD/biUl0rI1FJd2QQSGxOD3j17wsjQCH4H9gvvK7XMcvIvpYPedFtbtG7bFs2aNdNJyUMyciLKaVNtQXHYDhw5zF6UshRBILKgpaBnaYFOmTSZdaoNGzVUUKuiGUUioGwC+fbtG9q2aIlhI0fA2sZGkV0XbaUCATqR04bapm0bNGvePBUtaU9VytUyfMhQbNuxHaVkzOMjCERN80z61bEWFujVqzcaNRbum2qahj++VtkEcuvGTQwZOJAj71avUUPThq+X/aGD3egRIzF46BC9CdlDE/312zfUqlYd1hNtZI6NJQhEjZ8KLVh7OzvUb9AQbdu1VWNPxKuTIqBsAlm1YgW2bPbC2UsXkT1bNjEBakYgPCICk6xtMGDQQI46rU+FPM1aNm2G3P/8g9VrPWRS2QkCUfNKocmbNXMmTOuYooNZR5kmT81d1+nXK5NAyJtn9PARePb0Kc5cOC/sH2peSRERERhvMRYjRo9C9erV1dwb9bx+nMVYXL1yBf6HDsq0BwkCUc98/fZWUmfNtZ+DKlUqo7MO+pprAMQyd0GZBEK3mJs3bozWbdpgvoODzH0TFRSHAGWBHDNqFCytrfXavf7IkaMYM3Ikjp04gWw5sksNsCAQqaFS7oNEIgsdFvJt9b79+ir3ZaL1FBFQJoG8exsCs3YdsG7jBjTQk/D4KQKuhgeIPCxGjcakqVNhYlJODT3QnFe+e/cO9euYYv5CB7Rs3VrqjgkCkRoq5T9ILnXOS5yQN19e9O3XTyZRUvm90683KJNAAgMCMH3KVM798Y+WRmvWpNVAamBSC8oSn4ri1MWRxxS+A6Hvha4XEIG0atOGMZG2CAKRFikVPUeSyPLly5Eje3aO+Pmn269Pnz6Fk+MS3Lhxgy8lTpw8GSVLlMDFCxfh7OyE92/foUGjhpg4aRKyCSOtzLOnTAJZ4eoK7z17cf7SxVQl85F5UDpQgRI4Xb1yFd4+3jhz+jQoux45o1DI6KzZsqJMyVJo3bYNzDp1QrFixZJNzkUu1EQeM2fboYyMbqs6AOEfh9CudRtkzJiRA3tKe+teEIgGrgiSRFa5rYKRkSFGjBz5f5NJeckrVqiALl26YOzYsXBf447tO3dgrr09ZtrZYZqtLbshzrazQ9Dt23jw4AFy5cqlgSPV3C4pi0BobieMG4+Q169w9MQJzQVAw3pGUoazszMcHR1B0kPPHj0wcNAgFClcmC+/xcbE4seP77h1Kwiurstw7vx5lCpVCp6enjA1NU0YTdiPH+jXty9WuLmhQIECGjZK9XZn/NhxuHL5MvwOHpBamtMpAqGP89zZs/jxI4yz6FGubirEpvQ7CavSv+/fv8/2hgxJbl7S70icowtFmTNn/q2eKqeXs555eiLsRxjGjLVImFCSUDp3NOOxOS914Z/Tz+jm7MLFi+G1eTOrv6jQOOrVq4eunTtj+syZquy+1r9LWQRCwJi1bYfyFStgjYd8EVC1HlwZBkDfwYULFzBo0CBkypARCxwWoEGjRsicKdMfW6E6lKfca7MXFi1ayMbxDRs3cs6LiVbWLHmQdKLKQlLPtatXYVK+PPLkyfPbniTZmx4+fMikl3i/ot/9aQ9Luq+ldjxuK1di5fIVOHL8GDL+Bd/E79EpAqGN1LxrN07TuMzFhcMUU77fOqamnNObImoWL1EC27Zsxa9fP9HRrBNy5c6FDx8+8GnE19eXEydRtr1HDx9h8LCh2L/PD7VMa/92ikntRElbnxaP57p1oGi+FmPHsrsnieuFChbCnr17fjPAEiGWK1eOP5wcOXIkvGLxwoU4c/YsfP38pH2teA6AsgiEVDDkcz9oyGBWL4ryZwToe96wYQMmTJiAuXPmYPyECVKfjCWthoaGYtiQoTgRGIBqVapi3XpPFC5cWKWw0zgooq/F+HE4fvQo0qZLBzMzM2zx8kLDRo1wYP9+tGrVCnYzZ6Fdh/YoVKgwbgcFsSruwrlzCP3+HYWLFMHjR48wdNgwBJw4gffv3vMacnF25gjf7dq1S/WYzpw5g6EDB2GX915+nzRF5wiki1knlirKlCsLEntnzpoFi9Fj4L7WA/PnzeNNmEJHHDp4kDOL5cuXD29ev2axmMiFsgd+/fqVN2L62FcuX45RY8ZwRE51lW1bt+HRo4ccDp4WY53atTFgwAD+oCSFTi+kz6W+Z40Py0wZBFu1aIEqlSvDycVFXd3Xyvcqi0A+vH8Ps3btMddhAbp3766V2Kiq0yuWL8e06dNx8uRJVKtWTe7X0kGMNlqKenz58mU+aKmykCbAx8cHPXv25NdS+PQBgwbBackSDtS4edMm2EycyHax0ePGcnpjq4k2HMyRcpCQGnu1mxt69OyJ4Dt3cPr0GZiUN0HOnDnx6NEjjB03TiHDCQ6myLwd4bZmNWrWqiVVmzpFILRQenY3x9Yd21mKsJs1iwmERNncuXOBNtlKlSrh0+fPuHj+AodWDzh+HP++fInBQ4bg8MFDyJ4jB58C9vv6oWSpkvj46RMe3n8AKxtrqQBVxkM0Lt99vgi6dRNTbG1x6cJFtO/YAfPmzEXTZk1haGiEFy+eo03btrh08SIyZ86CiIhw7NixAyvd3HDt2jWUjFfnKaN/utimsgjk+bNnMO/SFWvXr0fjJo11ETqFjOnUyZPobm4Ofz9/1K5TO9Vt0jfkuHgx1qxegyvXrv4mpae68RQaoHe7LlvGWo4nT56gfPkKrBoPDAxAt27deD/6HhrKKuey5cri7JmzKG9SHt/DfuBdSAiGDh+ODZ7rYdbJjOsfP36cPcfatGuH3Tt2YsiwoQoZwqvXr9GkfgPMXTCfA0lKU3SKQKQZsDY/4+/nx0auWbNnsxg7efJkPHn6lBcjF0li8ni7T7WqVbF23TqUKFFCm4etlr4ri0DuBQejb6/e8D2wHxUripD+yU3uly9f+MCzeNEiVtkoqpBGglRH6dOmw+69e6T2NFLU+zW9nW+hoahRuQpGW1iw+l6aIghEGpTU8Myxo0cxf958REZGwMgoDZME0QSFv8iZMweyZc/OrovRMdFxtpGISBilMeJnqFCY8NjYGKIStutQMTQ0QFR0dNzvAMTERGP8+PEsGovyOwLKIpCTAQGsmjh9/hwKFSokYE8GgenTp+OAnx8uX7uWrBtuakCjPOBETmSYr1y5cmqa0rm6pB43KVMWnbt0ge2M6f8dTP8yUp0hENL979i+HU2bNUPp0qV5yKQfPLj/AGrUqom6dev+9cSxbetW9O7TR2MWBeXJnjhxIqZMmfJbv2Oio2FoZPSbtEGSBzkCODu7YM4ce6QxNv6/38PA4LefESGtXbuWE1xNsLLSmHFrSkeURSDbt27FogUOuHnntrifk8xkf//xA8WLFkXgyZOoUKGCUpYDfVM3r13HoaNHlNK+tI2SpycdFEn1LClkD+nRoyfSpU/HG/jGDRswYOBAdh54+OABH/yUeXelbq3abJR3dHHWLwIhF7lHjx/ziYXuR5CL29TJUzg0M/379atXfB8iMioK6dKmZXBo06UTuKurKxvSu5mb4/69e8ifLz/ef3jPBmtS/1y9epU/dvMePVSmOyUCWbhwIdsvpLlhS/adhg0a8MWq9OnTp7iGafzm3btzHUEg/w+XsghkxTJX3hSC799jt1JRfkeAvA6XLHFC0O2ghCCTL168gLOTE8ZYWChk86RLuGQLJXsCudSqq5CTDrnOli1bFq9fv+Y9iTwuyQno8+fPGDZ8OOjOF9lrjdOlRa9eveC6dClmzJqlNPVbh7bt4i4TrvcEJT1LqeiMBOK5dh2M0xpzSGKaENr4SZd6NzgYu3ftZo8qExMT9q7Kk+cf9qyihUS3WQsUyI+9u/eiYKGCmDx1Ksh7aeTQYahRoyYioyI5Ts758+cxdPgIFCmiGhdAIhAHBwdcv35dKgIhcmzUsKEgkJRWvJS/VwaB0EFmwdy5OHzoMK5cvwZjkhRFSUAgOiYG1apU4cux5HkkKX179+GLso0bN2YDsrS3pP8ELbnClytTBqtWr0YrGeI+KXKqJPfN3Fev5oPtUldXLFm8mO9fEHH4+vigctWqyJghA169eoUTx49j5OjR8Fy7lh1pUovBn8bSr3cffPz4Edt37+IDdEpFZwgkMDAQN2/cRFjYD/Zs+xWd6AAAIABJREFUKFO2LLvO3b97D1myZEYd07o4duwo8ubNyxcEycOD8x5PsMQSZycscnBAl27d2CebLvOQePns2XPUq1eXQyfQf/fq3Rv5C+RPCVOF/J4IxNrKCiNHjUqwYfytYTqxrFvnCUvLCVLrjXfu3IXhw4YKCSQZYKUhEMlFrqTV//bzmeRFd/ESh3EXBPI7cnSgq16tOl78+wJZsmRJ+CVtoAsWLMCkSZMUdgGwk5kZOzHMX7BAId+rrI3cvHkT3nv3olv37vgZ9pMPskWKFsH379/x/v17ZMqUGYOHDIa3tzciwiPw7u1bTvbk57tPYW67yfV55PARuHf3Ljt56BWBEBh0gjEkXX+8FxL/jIzGZDNI9G8CRqIWkvxb8je1YWRo+NvzRDQklUh+Lutiked5csddtmwZ9vn6wn727BTVHe/evecQDuTrbpwmzV9fSYZEd3d3dO7UCT169eJLTKL8jsC///6LJg0aYpW7O2ol40b68eMHbN+yjVWkiW/tkpsuqagopEzSUyKtuUlW1rhz5w4HUiR1qyhxCNA31rFjRxQrWhQrVq5UOixz7O1x/dp1eO/zUfq7/vSCxHtT4n1Isn/R+iE7rsSLkrQnRKx0OVpZxXLcOFy8eAmHjh3VPwJRFqjqajckJIQvPdFmlvhEllx/ZLGBBN26hVatWqN/375MjOz+K8pvCPwIC8ORQ4dgWrduvJ6cMKLDSRxWYWE/Wa1A0XQ3bN7Efx/w8+d4ZGSDatK0STyBSOrEHWwuX76Er1++supEWWoIbZxKugPhvm4t7ty+w5fnlF1Wui6Ht+8+HD16VMxDIrBtrKxw+tRpHA04IQhE2YtQ2e2HvHmDciYmrAPNlEJsGpkIJCgI5ubmuHrtqmQ/VPZQtK79ly9fol2r1nBZ7ooanOI0jkAkdEChJIYPGYLZc+xhWq8eS7Thv37BY/VqBAQEYuMWL3abjiOduEL/mjppMp48eYz9hw4JCSTRqvBY445Vbm64++C+VDa/1C6oObPtcf36NXjv25fapnSqvo2lFU6fFgSiE5Ma8iYE5UzKgTYzstv8rchEILdu8d2Pu3fv6gROyhhESjaQiPBwUCrUzIl09dQPUsWQx1+BggX/72RLEscUm4m4ffu2UGElmbQ9e/Zg+NCh8N+/n8NoKNtDrbNZJ1SuXAlz5s1TxvLR2jYtx43HhYsXcPjYMf2SQGgzvHXzJtq2a8fxbshFN2eOHChYqBAbK8mbqWCBAmxcpw2ZYhLRIqXTPRnHpXGVVfWqkKiwBIGoGnnlBFMkAplha4vLwoj+fxNK9gAKPbR8xQoMGzoUTs7OSpt08sIqXbIk3Neu1Qj7HxnRw36GaUTKhdEjRyL4TrD+GdGXLHbE9JkzQN4NI4YOYzfJiuXLo2v37siWNSsmTZ6MVi1bwsrKCvv27WMxLW/efPDf788xaDTRI4aM3eR6rHACCQpCjx49hATyly0qJQlEnt2N/Dvmz53HMdeu3riukWtOnnEpss4+Hx9YW9vg3oP7KTqDyPvex48fg8L80D0QcvtXZ6G9p2njJhg9ZjQnkKM0u+TI86eSPl06pao++/fpi48fPmCbvrnxOjk6YtqM/wjk8rWrqFShIsx7mLP6h+JGUeTLpATi5+/HqghNJBBlGtGFCuvv24YyCITeSBfBvDZtxp17d5WuplHnxijvu+m+Fnli+fr6oULFCqwZSPontc4HkyZO5HDpBw8flrebqa5HElevHj0Q8u4dWrdqjWnTp/E4a9Wsidt37vyx/dWrVnEiLWUVisZLXl6UlTAhxt5fXqYz90D+TwK5dhUVK1RE125d+RZ5UgI5deo0h3KXEAhN6McPH1GgYAGN8cqQEIjCjejCBpLi96csAtm2ZQsWOyxE0N3gFD3rUuykjj6waOEiOC5xZPd7OtylMTJiV+naNWpi6XJXFCxYUO6Rk0cjSfWXLl1Sey50sluuX+eJeQvmJ6jQSdtAUonEnkZ/J75XlDt3bmSnOHhKKvXr1mN8luhbKJMljo6YnowE0r2HObJIIYGMGDKUfZ8DAgJUni/gT2tBosJSuBuvUGGl+Pkpi0DI9XeipRXOXrwgUqr+YRbo5EvEsc5jLWynT0PB/PnhsW4dZ9dMjfRBl4HbtGyFvPnyYcu2rSmuAVU9QGorIg1lEoM0YyHcy5UqjS5du2DK9OnSVCE7839uhn+pIdVDVP/T589SXSp49uQpepmbY9vOnaheo7pUnf3bQ39SYXXr3o0TLCWnwipZogQ6d+nKJ5GdO3bg7dsQziVO0SglSZlS3bFUNCAkkFSAl8qqyiKQO7dvY0Cfvpx3WlnBAlM5dI2oTk4xlERq3ty5nAAutU4utDnazbKD1xYvBAUFpegWrwoQqE9k0G/TqjV69DDn8EqkwvvbDXBy/FHWBVS6BV+1UmVYjLXAoKF6Fs79TyosyvqWJWuW/yMQuoW6YdNGjBk1GgcPH/pN35c9WzYOsNinb99UnXhSuwgFgaQWQfnrK4tAJAmlPDdu4HSmovwZgXVr1/J36+3tg4aNGsr9LdIm7TB/PtxWreIov6rOSJjcCIkkKGwIaRkqVKrIce+IJOvXq4+79/7sXr9s6VI2tiujUEDHRpRQav48TlYlTdF5CSQ5IzrlB+/Xrx8sxozB+QsXksWJRGW6pdq0aVNpcFTKM0KFpRRYpWpUWQRC7uUd27TFgkUL0bVbN6n6os8PUYoGCmfu6OjIQRZllUQoSVLvHj1w+coVdOzQAavd3TXGYYaCKK5wXY5ly10TyJF+9jMs7I9TXqhwYaW5+967dw8d27bD6rUeqF6jhlTLTmcIJKkEIvHCSs6ITpn9WrVpk6IPeNEiRfDw0aOEWFpSIarAhyi4HInxwoiuQFClbEpZBEKbQ6tmzTnjG+XBFuXvCJCa58b1G+jduxerbhYvXoxmzZunmLKA4ka5ublhqYsLGjdqxHc+Hj18iE2bNmHpsmUaQyIkHdG4UmPbUdQaolS6QwYOxM69e1CkaFGpmtUZAnFyXIJpM6bH3QMZNgxXr19HRZPyMO/Zg/WdlESG3HgtraxABEIGK6/Nm/8KkqGBIU6cDMQ/avAVp5PqyOHDcezECbx89YodAf5WxE10qda71A8pi0CoA+1bt0GVKlWwyn2N1P3R9wfDwsKwxcuLc4VQxO0mjRujfceOIDtm+gwZEBMdg2+h33Dt6jXs37+fUz9XqVoFc+bMYbumRHI5f+48tm7xgqOTU4okpGzM/fz8MGP6DOTInh17fbyRM2dO0Dj/locjbbp0SiM/9zVrsMzZBYePH0OmFPYbCTY6QyCyTDYx7anTp6QSh9Map8XwEcNTDCUiy/tTepaTyQwZCvs5c1C7Tm1Mmz6dk2D9rVAMf0pOYzttWopGNlKNHTp4EMEilMkfIVUmgYwbMwZvQ97i6InjKS0F8ftkEKBgoOs8PXH+3Dn8++JffA/7wSf4XDlzciqGlq1acU4N2piTK0G3guDouBjuHh5qI5Ho6CjUql6TAzpu9fJCzly5MXLUSFQoXwHBd4P/OO9rVq/+LVeKIhfIhHHjcfH8eew/cliqvZHerXcEQiJxi+bNcer0aamwJ/GSktiQC6EqCm3uVhMmcEgH47RpMcnaRqqYNLL2LU/ePHBYtEjWanrzvDIJZLmLC/bt88X5SxfFZcJUrCgyRNMf+qaJQOgPSRrSqIMopD6dtpetWM4ZAFVdqM+TbGxw4eJFvA0JgY+vL3vlXbxwET9+fP9jd+iORv4CBRTeXXKdJfsHeXmt3bBeKgz1kkBo0JQ2kmJhSVOMjNKgQKGCCXlGpKkj7zNk67CdPBnLVqxQWepcefuq6/WUSSDHjhyF3cyZHFBRHepRXZ87acd3+/YdLHV2xvKVK9RCIhSy5O6dO/ytU8w+dRa6d9PAtC6atWiBKdNspe6K3kkgUiOj4geJPKZMmoQVbm5qv1Ck4qFr5OuUSSBv37wBhYygkO+mpqYaOX596RR5HjnMm8/fHbn762uhLIgN69aD3Rx7qV149VYC0bRFQuELrC0t2VNE3bdRNQ0bdfVHmQRCapYmDRuhS5cumDXbTl1DFO+NR4C8HWfYTuOEVinl3dFV0AIDAjF00CAcCTjBxnxpi5BApEVKSc9Rysp5c+Zg2fLlHLNLFM1AQJkEQjr6UcOG49nTpxzSRJJyWTNGrp+9ePrkCWbPssNyt5UaEYVC1bMw0coap0+dwsGjR2AQn9Jbmj4IApEGJSU9Q663FFiPApcJ8lASyHI2q0wCoS6tcHXFti1b2ZAu5l7OSVJwNSL0mTNmwGXZMlDQQn0pFEi2ZdNmyJkrFzzWe8o0bEEgMsGluIefPH4MaytrbNuxXS0GPMWNRDdbUjaBXL1yBSOHDsNe3318J0QUzUCAXOiHDx6KDV6bVOq6r87RUwysGlWrwWLcWPQfOFCmrggCkQkuxTxMAfUohIHTUhdkzJhRMY2KVhSKgLIJ5OvXr2jboiVGW4zBeEtLhfZdNJY6BCj6NXlDOi1dirx586auMS2oTcn1hgwYiM3btqFsubIy9VgQiExwpf5h8j8n18Glrq56a7BLPYrKb0HZBEJqg57duvMpd+8+H2EHUf6UyvSGd+/ew3LcODg6O6Uq/4hML1XTw3YzZ2GftzcOHD0iszZEEIgKJ43IY+G8+Vi3cYO4QKZC3OV5lbIJhPq0ds0auK9xx+WrV5A9Rw55uinqKBEBCisyeOBArPHw0FnvSDrI1K9jimIlimOVu7vMaAoCkRky+SrcuH4dG9avxyJHR04ZKYpmI6AKAvn65QvatmzFkXm7dO2q2YDoae8oJt3Y0WP4uy1aTLoAg9oEFUX/bdeqNWd6rN+wocxdFwQiM2SyV7h86TLcV69mF8H06dPL3oCooXIEVEEgMdHRfKGQ8lN4eK6TOnyEysHQ8xf+CAtjt+s58+aieIkSOoUGxc9bscwVB48eRdZsWWUemyAQmSGTrcKF8+exedMmuK5YIfTcskGn1qdVQSA0QBcnJ+zb641zly4Km5haZ/zvLw8NDcW4MRaY57AAhdQcdkRRMFEcsZbNW3DQSVnddyV9EASiqNlIpp3Lly6xr/+iJY5KC8GsxO7rddOqIpCH9+9jQN9+8Ny0UWUBO/V6YlMx+NBv3zB44CAsWOiAMmVl81ZKxWuVVvXdu3doXL8BJk6dIndyM0EgSpqegBMn4L1nL7vqGhsbK+ktolllIaAqAqHcD107d0bGDBnhf/CA1GG0lTVu0e7fEYiIjMR4i7GwsraW2eVV07B1mL8AW7dsweFjx5Aho3wRiQWBKGFWjx8/huPHjmP+ggVCr60EfFXRpKoIhMayecMGvhcUcOqk2qOyqgJbbX8HRfMeZzEWNhNtUKFiRa0czq9fv1Cvdh1UrloFLq6uco9BEIjc0CVf8ciRIzgZEIA58+YJm4eCsVVlc6okkI8fPqBDm7YYbWGBCVbiUqEq51ned1H48xFDh8HS2gpVq1WTtxm11Tt16hSGDhwkU/7z5DorCESBU+jj7Y2bN25g+syZKWYFVOBrRVNKQECVBELGzIF9+4FCShwPDBAHDyXMpzKapFP8dFtb9O7TBzVr1VLGK5TW5qABA0GZHf0PHUyVZ6ggEAVMEWUX8/P1xY3rNzDTbpZQWykAU3U3oUoCobGSP/6A3n34Mlez5s3UPXzxfikRIBKheyJDhg1DvfqqyVoqZdf++BjlHmrRpClGjB6FQUOGpKo5QSCpgi+u8q6dO0G3zGfZ2QkjqALw1IQmVE0gdAjp1qkzhzbx3e8vDiGasAik7APNnbWlFbp174YGclzGk/I1Cnts+lRb7PPxwaFjR5Epc+ZUtSsIJFXwgd10X756CZuJE7WGPD59+oSTJ09yOlXK9U4Jjqi8ffuW/04aQO7OnWA8uH+PDby1atVK2Ny+//iB4Dt3OC+1rmXWUzWBEO50H8RhwQJ4++5D+fLlU7kyVVP93LlzIHdQytVdNpFr69kzZ1G3Xl2t+SZSi1Z4eDjsZ89Gy5at0KRpE409ANB9lkb1G6BZ8+aYYTcrtcOGIBA5IaRTx7atW/H69WtY29ho1Ydy8+ZNXuC/fv4EYICjRw5zFrJWbdogKioKXps2ISYmFlOn2SJLlixYtdINrdu24fzNJUqVYnUdkc6gwYNx9PAR1tmXKFkC3nu9Yda5E9uBho8YAR9vH0REhCMoKAjjxo9nT6MqVSrj+fMXiI6J5ii06TU0rIs6CCTsxw+0bdUalStXwuatWzV2E0r8yUyeNIkPT16bNqNRk8bw9dmH9h07gBKl0WHDz9cPP75/x3jLCRxEtESJEhg4eLCcX51mV6O4UhOtrdGufXu0bNVKIztL3+DyZcuw28cbhQoXTnUfBYHICeHG9Rvw4eNHWNtYa8WHnniYN2/cxObNm5A+XXpYTbTBfj8/XDh/gUOLExmcDAiEWadO+PLlCypUrIAVy5fjzevXTJZt27XD25C3iImNQeUqVfD61StERkSCbtzTBkIxv+iSFUkxefPlw7YtW1CtenUOHvn40WNMnW7LOahJVTNqzJhUGfDknDqpqqmDQBAbi907d8HJ0RF79vmgQoUKUvVVnQ9RJruMmTMhrXFa9OrdC4GBgXj8+DHy58uHJk2b8rfx8+dP5C9QAGtWr4ZJuXLo3bevVh24ZMGXDpaU2ZCkrzZt28pSVenPfvv2DfVN67KtxmHxYoXsW4JAZJw2Utd4uLvzSX2MhYVCJkHGLqT68dtBQciYKROKFSuGhw8e4MrVqzh76jQGDB7E8XAunb+I1m1a4/OXL6xKoYixXbp1xa4dO1G/QX34+/oiS9as6NGrF7sskyGRIpcSIeX+5x+YlDeBw/z5cFu9GtNtp6F0mdJo1Lgx6HIlGRtXrViByMgoDB46hNVomljUQiAASAqh+FiVKlfC+o0bNRGa3/o0Y9p0TJsxncOAr/VYizx5/sHhQ4f5kl3z5s2RLn169i6jXOMBx09wGt85C+bDOE0ajR+bvB2kvWHBvHmoXqMGOnTsKG8zCq/n7OSENW6rsHPvHhQpqpjAkIJAZJgmIo91HmsRERmB0WPGaO0pikRtOhmSGopOTHQyoSCP9DOSQOgDoNvz9Dv6byIIiiBM9ajQ7+l3VIf84amQhBEa+h2ZM2eKO3X++oWMGTJwHSIXkjhIT0x16O/omBj+vaYWdREI4UEqxJWuy7H/8CGULFlSUyHifpEaNH38PNJck10sjZERry1aE1Qk64iCEqY1NtaLVAa0V8yfOw8VK1bkw5e6C0mBjerVR/kK5eHs6qqwvUsQiJQzSx8B2QKM0hhh5KhRUtYSj2krAuokECLl7p06s4cMhTdJo8OndW1dH9L0m/aMRQsXomzZcujcpbNatRVTJ0+Gv68ffA8eQA4F5p4RBCLFSqCFsMTREXny5MHAQYOkqCEe0XYE1EkghN2RQ4dA7parPdzRomVLbYdTb/tPkojzEicUKFgQffr2UQsOz549Q5uWrdDd3Bw2kycptA+CQFKAkxYAGZFzZM+BfgP6q/UUodCZF439FQF1EwhJIX169GQV4MEjh2VONSqmV3MQoAPosqVLkTVrVgweMkSlewitn+FDhoIig/vs92dvS0UWQSB/QZNFUIeFKFioIPoPGKBI3LWmLSJQMrrfvn2b03o2atQImbNk0Zr+y9tRdRMI9fvpkyfobd4DoyzGcPRXbSi0XiT3iqi/Sf9bG8agrD4ud3Vlt3jSYpCdUBXlxIkTGDl0GOznzkHbDh0U/kpBIH+AlBb+wgUOKGtSDt26dVM48NrQIBnLe3Q3h99+f94IqGTLlg37/fezm6IuF00gEMJ39sxZOH7sGAJPn0Lu3Lk1GnJy4R42ZCjfMShWtChCQkLQoV17LHFawi69+l7oQLp+nSfCw39x4ExlF/p+mzdpytKr17atMFKCLU0QSDKzSJslGb9MypdH586dlT3PGts+2X2mTJ36f/3LkjkzfHx8dHpT0BQC+fL5M3p07cZZ8Hbs2a3RHky0JgYPGoSAwEBUrVoVd4OD0bBhQzguXozBQ4dq7DpXdcc2eK7H58+fMMHKSmHeUEnHQGRlb2eHHdt3YP2mTUrLXSIIJAnypDOki0A1a9VEJz0mD1qAZcqUwZMnT5L9vkgEJ3//5i2aq/r7U8n7NIVASNFx7MgRTJ08BXZz7PVWlaqSSVfhS7y8vPD+3TtMsLRUColcvXoF3Tt35Vv/ljbW7EqtjCIIJBGqRB52M2aicdMmGhuKQBmLILk2SQqj2EZ/IhCqQ3c6KJAkhW7QtaIpBEK40sdvOW4cbl6/gQNHDqNgwYIaDff3H98R+vUbuyGT4ViU/0eA5nT3rl14cP8BbKdPUyiJ0L2rjm3b8f2r3ft8kDFjRqVNgSCQeGhpw7SdPAUtWrdCS+E2yajYTpmKRY5/D3lAFwy3bduGTp06KW2RqqNhTSIQGj/Fk+rWuQvf3N+7z0djVVnkdEJrJiI8HGmMjTF40GC2gdCFVFH+H4E9e/bg1o0bmDV7tkIwImKaMmkS/P384bV1C4or+SKqIBCAb1PbzZyJ5i1bokWLFmKdxyNAqTubNW6CK9ev/RGTRg0b4vXrN7C3t+dYSLpSNI1ACNezp0/Dctx4zuMwafJklXnySDunhw4c4PA2vvv2oX6DBrh16xZatmgJV9dl6Ne/v7TN6N1zFHDy+rWrmDZjRqovjR4+dAhjx1hg1OjRGDJ8mNKx1HsCIcljkvX/2jsPqKqOrg2/gCC9Cir2jlgoGhVUJGqisfdeYy8gRKOS2MWGgrFQ7B1BEYwaK+JnFDVRjFEsYEGlCiodC6j/2mPwT0xMLuVy2z5r3aXiOXPOPDOc9+4ys6eLid+yVUupA1e0G5AZ7NyuHaKu/l1EvurcGWEHDwpT2dHBAXPmzMXgIYMVrYv/+LzyKCB4B3h7eSE4KAhbdmwXKdXydBwIOSDcml27/b9L89TJk0hMSChx4SJ56qc0nuXY0WP435kILFuxotjurMePH+PL9h3QuEkTUaq2LKw+lRYQSnNznzYNQ4YOhYOjYlQTk8bk/a82yRLp3LkzqPZD4dGrZ0/sDQr64EpJS0tD2zZt4OHxHUaOGvlfTcr9/8ulgPyxD9nXI0YiIT4ex06dRKVKleSeJT+gZATCT53C0Z9+gteqVUW2RMiL0qtbdzxJTcX+0AMwKeUFg5/qgcoKCG0uNvvbmWJr6VYOrSQbYRU+iwrR9OreQ6xH6N+3L3bu3v03P3x6ejocWrUSaZyVK1dWaFryKiAE9WlaGoYPHgJDIyOEhIVyoFqhZ9pfH54W/p04dhyLl3hKHOeiL8IuU6bg5/+dhf+mjWjStGmZEVFJAcnPz8ekCRPg/s10Ue+CD8kIELcvOnYExT0WLl78jz54t2nT4OjYGgMGDpCsUTk9S54FhJBR4HXM6K9FZTnaL0u9jFY2y+lwKdVjnT9//v2OzP7+ErmhfNevF/ttzfKYjf4DB5YpC5UTENpKnAKR4yZMgH0z+zKFrQw3o63dhwwahAb1G2DJ8mV/89dOnjQZX3zREb37yH4L65LwlncBob4dOnhQbBlOlSEpFbSstscoCVe+VjICv1y6hO3btmHNunX/aokcDAvDrBnfomef3pjl4VHs+IlkT/X3s1RKQMiXP93dHZMmT4GNrU1xman8dRQ0HzJ4MOrWqYvlXis++GuppjpZJ+cjI+W2UJSkg6cIAkIpm37r1mPHtm2ivvWIkSNZRCQdYAU4L+rKFWzdvAUrV/v8Y+2ca9euYdigwbBr1gyr166RyFop7W6rjIBQzGPS+AmYt2ghateqVdocVa498ruOGDFCVDR0cXFB3IM4+AX4Y8eOHSLgruiHIggIMaYswjkeHgg/eQq+AQH4spN81uJW9Pkgq+enjUx9fHzgHxAgiroVHrGxsejZtRtq1KyJHbt3QetP/1eWz6oSAkKWB+VGe3znIep181E6BGjl/s2bN3Hu559RwawCOn75BczMzEqncRm3oigCQpgoNjV10mREX78Ov40b4OzsLGN6fPvSJBB9Ixo+3quw1tcX+np6oPoetD8aLdTcExwkdsmW1aH0AkLlWsnyWOS5GHXq1pUVZ76vghFQJAERIvL6NSaOG4+YO3ewYfMmtGnbVsGI8+P+GwGyOFYsXYbv587FoP79oamlJcSDdseW5aHUApKVlQ03VxcsXLQI1apXlyVnvreCEVA0ASG8FJui2g9xcXHvRaRNGwWjzo/7bwTORERgyqTJ0NfXx/ZdO1HZ0lLmwJRWQLKyszF21Gis9PFGjRo1ZA6aH0CxCCiigBDhF3l5mDh2HOgb63p/Py6Hq1jT7pNPS18K+vfpAzU1dVHbw6JiRbnomVIKyNOnT+E6ZSq8vL1Rtap871wqF7OAH+JvBBRVQKgjlGrt7uIKKvC0eOlS9B/Qn0dYgQlcuXwZX48aLcrRbtm+DaZyFGdUOgF5/vw5vp0+HZ5LlsiFiafA81alH12RBYQGjra2mDPbAz+fPYspLi6Y4jJVJmmeKj2JSth5StOmPbLofUYFxXw3BMhdkopSCcjz9HQM7tdfBJfkvfxnCecWXy5lAoouIIRHVNZcshQhISHo3qMHfFb7SKWsqZSHQiWbJ/HYtHETvJYtE9Ud/TZthKamptyxUBoBSU5OxuyZM+G9ejWLh9xNM8V7IGUQEKJOL6KgvXuxxttH7JHktyEAFhYWijcgKvTE5IKc+/0cHAwNRa8+vTFj1iyJ98Uqa0xKISC0E+wMN3d4+XijopwEl8p6IPl+pUtAWQSkkMqlCxdFoSGqZ++3cSNsbMpuw73SHRnlbi0lJQUTxo5FTEwMXN3cMGjIELneXUDhBYQsj5HDR2BfSAiMjWWbE63cU1u1eqdsAkKjRzW4x48ZK+pzzJ0/H8NHjpDrl5NqzTgg8sIFjB9CCEk4AAATF0lEQVT9NdQ11LHO1w82drZyj0ChBSQxMREL5s/HylWrZLoaU+5HmR+wyASUUUAIApXGpQVpVLnOydkZ3qt9ZL4YrciDo2QX0AavVAp4z65dsGrYECu8VymMJ0VhBeTRo0einodvgL9Ib+ODCZQmAWUVkEJGRw4dxoqlS8UeSj+sXQOndu1KEx+3JSGBu3fvYsrESWJ7kuEjRmDS1CkKlS2nkAJy//59zPv+e2zcsgV6enoSDhWfxgQkJ6DsAkIkkhIT8c00Nzx48AA9evbEQs/FYq8lPqRPgPYvC/D3h++69TAyNMSKVSthY2cn/RuX8h0UTkDIbTXH4zuxypbFo5RnAzf3gYAqCAh1ljbE3LNrNwL8/IR4eC5bii87deLYiBR/F2gD0mkuLoh/9BhdunXDzNmzoK2jI8U7Sq9phRKQ27duYdGCBdiweTOX8ZTenOCWAaiKgBQONtVYnz93ntjRl+pLUJ2XWlz2oFR/F2iRM8U6fgwLE1uRLPL0RFNbG4UWa4URkNu37+AHH29R5rFcuXKlOrDcGBP4mICqCQj1nxYeHj96DKu8vECB3cFDh8DN3R0GBgY8QUpAgFjSWhwqO1uQn4+Ro0dh1JgxcrkwsKjdVAgBuXfvnrA8Nm3Z8peiKkXtLJ/PBCQloIoCUsjm1cuXwje/LyhIbBvu6jYNY8aOVajgrqTjLM3zaBFnRESESPbJzMjAZy1bChehLOt3lHZ/5V5AoqKi4Lt2LdYHBPxjWcfSBsLtMQEioMoCQv2nl19SYhLWrPbB+XPnxUtvqqsLevbqJbYT5+PTBMjiOHv2LLy9VuLRw4ewbtQI07+dAStr6zKvWS7tcZJrAblBFdZ8/eDr76d04KU9sNx+yQiouoD8md7DuDjh1oq6EiUC7bQ5Y5++fWAkw0p4JRtd6VxNZbMjTkdg5fLlSExKQp06deA+YzpatGwpnRvKQatyKyBXr17FGp/V2LhlM7ut5GCiqNojsID8dcTJIklOSsJSzyW4/Ouv4nfyq6++wrezZ4m959TU1FRtinzob3Z2NrZv3YbtW7eCKqDWrV8P8xcsEOWz1dTVlZqLXApIZGQk9gcFw8t7ldxuIqbUs4I7p/IurE9NgUIh2bl9u1jN/urVazRt2lTESFq3bQNdXV2VEBPaLv/atWvYunkzIs9H4t3bt2jl4ICxE8ajbr16KhMvkjsBuXjxIoID98JnzQ/stuIXucwIsAXy3+ipDntYaCj2BQULwS2nqYk+/fpiwIABaNCgAcpra/93Iwp0BmVQJSQkIPRAKAID9yDjebqwvrr16IGhw4fB2MREgXpTOo8qVwJy5swZBAUGYr2/PzQ5Vbd0RphbKRYBFhDJsdG378ePH2PXjp04c/o0MjIyROEjJ+d2GDl6NOrVqw8dHcUUE7I0EhMSEbQ3EEcOH0FKcrKwsuya2WP8hImwamil0jVW5EZAToeHC5N42YoVKmP+Sf4rymeWNQEWkOIRp1oWMXfuIDTkACLPn0f68+cwNDIUmUhdunRFS4dWqFevXvEaL6Or4uPjQdmfR48cwW9XfxN9oJXiLVq0QI/evdCseXOxNobceap+yFxAAvcFIz09HRHh4Vi4eLFSLK5R9UmlDP1nASn5KNI2Kbdv3hJldelD28hTiqu+gQHs7Oxg38werRwdUa1aNbGzhLa2dpnGT16/eo3snGwkJCTiatQVkRxw7bdrYtt7WqxMtYVo7Ua7z53RvHlzpXPJlXyEAZkKyMB+/TB67BhkZWbCc9kyaCh5xkJpDBi3UTYEyCXzeVsn+G3coNRpmGVBszBDixbT3Y2Nxbmff8aZiAhkpGcgNzdXxDqNTYxR2dISDRpYwbqRNexsbWFesSJ0dHTEjsHa5csLz0RRsr1IwF69fg1aGEkptlmZWfj9999x/fffhZWUlJSE58+eifrxOrq6MDIyFNZFh45foFHjRjD/o3IjWxqfniUyFZBB/fsLi4OyF4oyMcpi0vM9VJvAy1cvceF8JAuIFKYBJfyS8+f1q1fiBU4v9egb0YiNjcHDuId4mpqGt+/eCiuAPhr0p4aGeFcYmRjDQN8Aevr6KK+l9SH+QGJB7eW+yENudg4yMzOFcNDP8wvy8aagAAUFb0RvKNhdtVpVEehv1LgxbGxsUcmyskhNJpFiwZB80GUmILSV9MxvpouJwgcTkEsC7wCPuXNELXE+pE+A9uJ6S0KQn49naWlITUsTAvPsjw9ZLBnp6cjLywPFWshyoJc9fch7oa6hISwW2qXbwMgQxkbGMDevABNTU5iamYmMKbIq6BwSCrJ8+CgZAZkJCD02D2DJBo+vlj4BeqnxIR8E/uyl+JTH4h3ZNn/EttmSkP64yVRApN89vgMTYAJMgAlIiwALiLTIcrtMgAkwASUnwAKi5APM3WMCTIAJSIsAC4i0yHK7TIAJMAElJ8ACouQDzN1jAkyACUiLAAuItMhyu0yACTABJSfAAqLkA8zdYwJMgAlIiwALiLTIcrtMgAkwASUnwAKi5APM3WMCTIAJSIsAC4i0yHK7TIAJMAElJ8ACouQDzN1jAkyACUiLAAuItMhyu0yACTABJSfAAqLkA8zdYwJMoOQECjdm/HgTR9psU5U3hWUBKfnc4haYABNQYgIkEqtXrYKamjrad+yAXy/9gipVq4iKhb7r1mPj1i2iVgnVHzl18qSood7ss+aws7cXW837r/eFc/vPJSoLQAIVsm8fCvILMHDIYLmnygIi90PED8gEmIAsCdy+fRujhg3H5KlT8Osvv+DevXvQUNPA4qWecJ/mhvYd2mPOvHkYP2YsHj58KGq+37h+HT1794ZTu3Zwc3VFl65d0aNXT1Hv5MWLlzAwNICurq4o4/vg/n1oammhqY2NqM7q5uKK/Nev4eruDifndqIGyo0bN2Cgrw9bO3tolNMQ9VCuXrkCTU0tGBoYIO1pGoyMTUT9dromJzsbFy5cgKVlFSQnJX3AR7VSHNu0xoMHD/AwLg6WlpZoaG2NuzExSExMhGWVKsjNyYWtvZ1EyFlAJMLEJzEBJqCqBNxdXHHnzh0cPnYU3l4r0b1nD2zbshXLViyH98qVOBR2EIdPHEef7j3QuEkTTJ3mKopaUQGrpZ5LcPzYUViYW8DJ2RlUKplqr+vq6MDV3Q3hp8JFtcS0tDQU5OdjiqsrlixejHdv36K+lRUmTpqIb6fPQIuWLRD/OF5UaNy8fRvGjByJ+PgE1K1bFzExMTA2NsZUVxcsnDcfP/50BJcuXMSiBQvw3ZzvsX/ffpAVFffgAeybNUPrtm2wdfMWtGvnhEsXL+GLzp2go62N7du2i9LB/QcOhIvbNImGmwVEIkx8EhNgAqpKYNSwYcjLe4G9+4LRt1dvpKWmQk1dHUdPHMeBkBCsX7MWFy7/iojw0/BavlxYB1SCd/DQIRgzbhyc2zrB7Rt3DBg0CC6TJ+Ne7F0c/OkItLS0EH3jBoICA3Hj9+ui8uKR48fgMXM2Xr58gR17duPrESNx9+5dtG7tiKysbERduYKFSzwx//s52Lt/H2rXqYNlnp6IPHceQSH70b1LVwwbPgznzp1D9eo1sNBzsajcSNYRxWrW+a4X5xgYGKCRtTUePX6MhPh49B3QXwjNsRPHRblgSeM6LCCq+lvB/WYCTEAiAvuDg+GzchUC9wXD0NAQ+4KDYW9vj+affYYhAwcBamrYuXsXwk+eQhuntuLbPonKsWPH8NOJ4+jyZae/CAhZEmGHD+FJSgr69OyFb2ZMx4sXL+Dv64efSEBmzcKLvDzsDAzE0IEDkZqahkWenlBTV8Pzp89g37wZ+vbshX4DB6J3n96YM9sDmZkZCDt8GDt37MCObduFVbMnOBhmZqaYMnES3rwpwFo/PxGr6db5KzRu3Aijx4xBTk4O1NU1EB19AwdDw3A8/JTE4kHwWEAkmkJ8EhNgAqpKgCyKQX37IT8/HzM9ZsPG1hZPnjzBD94+woII2LQJterUxsRx45EYH48qVasi/vFjITBLli8TVktebi4cW7dGVnYWEuITsD8sVFgyvXv0RJMmTUTsgtxbY8aPx7OnT/FjWBhq1KyBCZMmY+G8edDT1xOBdSNjY+wO2otDB3/Exg0boK+nBz1dXWRmZSL00CHk5uSga6fOqFO3LnbtDYTHzJk4efyEcH1RHfiq1avB2flz7Nq5E+YVKiArOxtt2rYVsZBDP/4oBIysK0kPFhBJSfF5TIAJqCwB+qY+cew4xMTcgRrUBIfy2trwCwhAE5um4t9keZAQ0MfE1BSmZmagrKq8vDwkJybBolJF4dp6++6diJHQkZmZiaepqbCsWhWZGRnQJUHQ00NiQoKIR5hXrChcYinJySLgbm5hIcTAa9lyNGxkLZ6E4jK2draYu3Ahrl+7Bo+ZszBn/nx07d4Njx4+FEH4wkOrfHkRNKdgfUpKinhGMzMz4eYigdTX1y/SGMtUQCgjgdSOwH+cX03pb+pqanj3R3cIFP29MB+b1PS3q1dRqVIlmJiYQqu8ljjz5YsXQmkpq4EO0Y66+vvr6KP2fvipLbon+RfNzc0FaPpm8fFzFIkmn8wEmIDSEnjz5o0Qh9TUVOHKopd5+fLly7y/9C7bHxSMS5cuCdeUjY0tho4YjqjLl7E3MBCNGjfG2HHjUE5TU+rPJjMBocFY47MaVapYigyE7OxsZKRnQEdHB46tHXH06FG0cnBA3IM48VInUPn5BUKl+/bvB8e2bREWEiLOr1ixEnJzc0R6Xe3adYS5eO/+PZGZkPrkCSpUMEe9BvURe+eOuJeGRjmR6kZm2+FDh2BmairMzuYtWojAFh9MgAkwAXkn8E+LG+lnZfklWGYCQh09c/q0yCK4/MsvqFatOpra2uLWzWjUql0bt27ehJ6ePt69eytMQB0dXRSQiLx+DQNDQ9jZ2eHE8eNoYGWFpMQENGlqi4jwcDRv8RmSEpOQ+iRFGByU4kbiUbNmLdy+dQvmFuYwNjKGdeNGuHP7tjDfSLwoV/rzDh3KFL68T1B+PibABGRLgBYnvnj5EufOnhUxFW0dHeHCKigoEGm5NWrUALmlKO2XXFz0LqMvwZRJlZGRIdxSJiYm4u/0J7ni6It1bm6uWJNC15KLjK6l+AlZLZTSSz+X5JCZgNDDkRVCLify+9FBylmoqvTvQl/inztSeM5z8jMaGwuXVKGLimCR20ujXDlxCYkNZRi8ffdWZB/8WZ0py4EGgwaI/iz8v4+fofDe9KwEvNA19vF52VlZQtg+/lbwX+0W9luSweJzmAATUC0CRw4dEu8zernb2trh1q2bqFKliljQSB6TatWqYc+u3dDT04WBgSEcWjsiNiZWrCmhwD6l9xqbGMPU1BQpySlo1KSxWLAYFLgXDo4OOH3qFOrWry/etZUtLUVsJCc7R6T1SnLITEDoxbrRP0D4ECtbVkZ2VjY+79AeoSEHULtObTx69Eh0hgI+FLV48+4tNNTVhXWSkJAgOkzxEwpAte/QUaSh0UrNp8+ewcjISIhTenq6CAp92akz/H3XC4vEyspKgIqKugILCwshLLq6enjw4L6IhdAnOjpaWCY0UMLfaWSE8lpayMvNg76hgci0oMG7dPGiiN9UMDNDYmISrBpagVat0nWk4LF3YqCppSnUvXbt2uL/zCuYi3Q8EiBSfnK5NW7aRJKx4nOYABNQMQIXIyNxMzpabIOS/jwdlSpXQlRUlHi/tXVyQlJiIpKSkoR1QSvbKZPLqZ0Tdu/cJTwqMbdvo6F1I6SlpaJmzZqoVqMG7t+9Jzw89F6j0ABZI2TJ0CcnNxcJj+PRpXs3iUjLVEDu3b0rTCwyyWhZva2dnVjWTy/fJ8nJqFe/vugcoCb2nrkbG4s6devh+bOnIsuB3FPa5bWRkpIsXviU4kZBdYKanp4hYiG0ZUArRwdcvRIlrAcy5WrVrIWHD+OQmZEJK+uGwqSj+9KzVK5cWbzYk5KShcCkpz8XIkcxEkqvo9WlL1+9EtkUN67fgH0ze5A1RLEYsnZSU59A38AA1atXx4XISNF2dnaOuI5S/ipYmONNfgFq1q4lcr1btGpVpLxriUaVT2ICTEBpCHzKK/KxZ4beYSQ29KWb3mVWDRt+8Or8UxuFP5Ok/U/BlJmAKM3oStgRcn9R5he528oyyCXh4/FpTIAJMIEiE2ABKTIyvoAJMAEmwASIAAsIzwMmwASYABMoFgEWkGJh44uYABNgAkyABYTnABNgAkyACRSLAAtIsbDxRUyACTABJsACwnOACTABJsAEikWABaRY2PgiJsAEmAATYAHhOcAEmAATYALFIsACUixsfBETYAJMgAmwgPAcYAJMgAkwgWIRKHUBKdZT8EVMgAkwASagtATe13DkgwkwASbABJhAEQmwgBQRGJ/OBJgAE2AC7wmwgPBMYAJMgAkwgWIRYAEpFja+iAkwASbABFhAeA4wASbABJhAsQiwgBQLG1/EBJgAE2ACLCA8B5gAE2ACTKBYBFhAioWNL2ICTIAJMIH/A8cs+nKfG/YOAAAAAElFTkSuQmCC");
}
</style>
