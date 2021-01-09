#include "SpaceCab.h"

using PC = Pokitto::Core;
using PD = Pokitto::Display;


void Game::playTakeMe(uint8_t platformNumber) {

    #ifdef SOUNDS

    char sounds[40][31] = { "music/SPCAB_FILES/SPCABF10.raw", "music/SPCAB_FILES/SPCABF11.raw", "music/SPCAB_FILES/SPCABF12.raw", "music/SPCAB_FILES/SPCABF13.raw", "music/SPCAB_FILES/SPCABF14.raw",
                            "music/SPCAB_FILES/SPCABF15.raw", "music/SPCAB_FILES/SPCABF16.raw", "music/SPCAB_FILES/SPCABF17.raw", "music/SPCAB_FILES/SPCABF18.raw", "music/SPCAB_FILES/SPCABF19.raw",
                            "music/SPCAB_FILES/SPCABF20.raw", "music/SPCAB_FILES/SPCABF21.raw", "music/SPCAB_FILES/SPCABF22.raw", "music/SPCAB_FILES/SPCABF23.raw", "music/SPCAB_FILES/SPCABF24.raw", 
                            "music/SPCAB_FILES/SPCABF25.raw", "music/SPCAB_FILES/SPCABF26.raw", "music/SPCAB_FILES/SPCABF27.raw", "music/SPCAB_FILES/SPCABF28.raw", "music/SPCAB_FILES/SPCABF29.raw", 
                            "music/SPCAB_FILES/SPCABM10.raw", "music/SPCAB_FILES/SPCABM11.raw", "music/SPCAB_FILES/SPCABM12.raw", "music/SPCAB_FILES/SPCABM13.raw", "music/SPCAB_FILES/SPCABM14.raw",
                            "music/SPCAB_FILES/SPCABM15.raw", "music/SPCAB_FILES/SPCABM16.raw", "music/SPCAB_FILES/SPCABM17.raw", "music/SPCAB_FILES/SPCABM18.raw", "music/SPCAB_FILES/SPCABM19.raw",
                            "music/SPCAB_FILES/SPCABM20.raw", "music/SPCAB_FILES/SPCABM21.raw", "music/SPCAB_FILES/SPCABM22.raw", "music/SPCAB_FILES/SPCABM23.raw", "music/SPCAB_FILES/SPCABM24.raw", 
                            "music/SPCAB_FILES/SPCABM25.raw", "music/SPCAB_FILES/SPCABM26.raw", "music/SPCAB_FILES/SPCABM27.raw", "music/SPCAB_FILES/SPCABM28.raw", "music/SPCAB_FILES/SPCABM29.raw", 

    };

    uint8_t index = platformNumber + (this->maleOrFemale * 20) + (10 * random(0, 2));

    if (soundEffectFile.openRO(sounds[index])) {

        auto& music = Audio::play<1>(soundEffectFile);
        music.setLoop(false);

    }

    #endif

}


void Game::playHailTaxi() {

    #ifdef SOUNDS

    char sounds[2][31] = { "music/SPCAB_FILES/SPCABF01.raw", "music/SPCAB_FILES/SPCABM01.raw" };

    this->maleOrFemale = random(0, 2);

    if (soundEffectFile.openRO(sounds[this->maleOrFemale])) {

        auto& music = Audio::play<1>(soundEffectFile);
        music.setLoop(false);

    }

    #endif

}

void Game::playSoundEffect(uint8_t effectNumber) {

    #ifdef SOUNDS

    char sounds[6][31] = { "music/SPCAB_FILES/SPCABS00.raw",    // Ouch Female
                           "music/SPCAB_FILES/SPCABS01.raw",    // Ouch Male
                           "music/SPCAB_FILES/SPCABS02.raw",    // Kaching
                           "music/SPCAB_FILES/SPCABS03.raw",    // Explosion
                           "music/SPCAB_FILES/SPCABS05.raw",    // Roller Door
                           "music/SPCAB_FILES/SPCABS05.raw",    // Fuel
                           };  

    if (soundEffectFile.openRO(sounds[effectNumber])) {

        auto& music = Audio::play<1>(soundEffectFile);
        music.setLoop(false);

    }

    #endif

}

void Game::playTheme() {

    #ifdef SOUNDS

    char theme[31] = { "music/SPCAB_FILES/SPCABS06.raw" };

    if (mainThemeFile.openRO(theme)) {
        auto& music = Audio::play<0>(mainThemeFile);
        music.setLoop(true);
    }

    #endif

}


