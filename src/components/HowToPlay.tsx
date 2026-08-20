"use client";

import { PixelIcon } from "@/components/PixelIcon";

type Props = { onBack: () => void };

export function HowToPlay({ onBack }: Props) {
  return (
    <div className="panel">
      <div className="howto-list">
        <section>
          <h3 className="howto-head red">CONTROL</h3>
          <div className="howto-row">
            <PixelIcon name="arrows" className="howto-icon" />
            <p>
              Tap LEFT or RIGHT to move the boat between the three catch positions.
            </p>
          </div>
        </section>

        <section>
          <h3 className="howto-head green">CATCH</h3>
          <div className="howto-row">
            <PixelIcon name="catch" className="howto-icon" />
            <p>
              Catch parachutists jumping from the helicopter — each rescue is worth
              one point. More jumpers appear and fall faster as you score.
            </p>
          </div>
        </section>

        <section>
          <h3 className="howto-head red">MISS</h3>
          <div className="howto-row">
            <PixelIcon name="shark" className="howto-icon" />
            <p>
              A miss lets the shark below catch them instead. Reaching 200 or 500
              points clears all misses.
            </p>
          </div>
        </section>

        <section>
          <h3 className="howto-head red">GAME OVER</h3>
          <div className="howto-row">
            <PixelIcon name="misses" className="howto-icon" />
            <p>Three misses and the game is over.</p>
          </div>
        </section>

        <section>
          <h3 className="howto-head green">GAME B</h3>
          <div className="howto-row">
            <PixelIcon name="parachute" className="howto-icon" />
            <p>Some parachutists get stuck in the trees before dropping again.</p>
          </div>
        </section>
      </div>

      <button type="button" className="btn btn-brown wide" onClick={onBack}>
        OK, GOT IT!
      </button>
    </div>
  );
}
