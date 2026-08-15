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
            <p>Catch the skydivers to earn points.</p>
          </div>
        </section>

        <section>
          <h3 className="howto-head red">MISS</h3>
          <div className="howto-row">
            <PixelIcon name="shark" className="howto-icon" />
            <p>Missed skydivers are eaten by sharks.</p>
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
            <p>Skydivers snag on palm trees and drop without warning.</p>
          </div>
        </section>
      </div>

      <button type="button" className="btn btn-brown wide" onClick={onBack}>
        OK, GOT IT!
      </button>
    </div>
  );
}
