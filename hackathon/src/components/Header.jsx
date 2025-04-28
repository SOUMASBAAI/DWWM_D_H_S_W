import React from 'react';
import backGround from "../assets/img/background.jpeg";
import ObShot from '../assets/img/Obshot-1.png';
import Arrow from '../assets/img/arrow.png';

const Header = () => {
  return (
    <header className="w-screen h-screen overflow-x-hidden relative">
      {/* Background principal */}
      <div
        className="w-auto h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${backGround})` }}
      ></div>

      {/* Image ObShot par-dessus */}
      <div
        className="absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col gap-2"
      >
        <div
          className="w-1/2 h-1/2 bg-no-repeat bg-contain bg-center animate-pulse"
          style={{ backgroundImage: `url(${ObShot})` }}
              ></div>
              <span className="w-170 text-3xl text-[#c4c4c4] animate">Obshot lets you capture any object in real-time with unmatched speed and precision — just point and shoot.</span>
             <span
                className="bg-contain bg-center bg-no-repeat block w-16 h-16 animate-bounce"
                  style={{ backgroundImage: `url(${Arrow})` }}
                  
             ></span>

      </div>
    </header>
  );
};

export default Header;