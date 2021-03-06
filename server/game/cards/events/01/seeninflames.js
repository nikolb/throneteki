const DrawCard = require('../../../drawcard.js');

class SeenInFlames extends DrawCard {
    canPlay(player, card) {
        var otherPlayer = this.game.getOtherPlayer(player);
        if(player !== this.controller || this !== card || player.phase !== 'challenge') {
            return false;
        }

        if(otherPlayer && otherPlayer.hand.isEmpty()) {
            return false;
        }

        var rhllor = player.cardsInPlay.find(card => {
            return card.hasTrait('R\'hllor');
        });

        return !!rhllor;
    }

    play(player) {
        if(this.controller !== player) {
            return;
        }

        var otherPlayer = this.game.getOtherPlayer(player);
        if(!otherPlayer) {
            return;
        }

        var buttons = otherPlayer.hand.map(card => {
            return { text: card.name, method: 'cardSelected', arg: card.uuid, card: card.getSummary(true) };
        });

        buttons.push({ text: 'Cancel', method: 'cancel' });

        this.game.promptWithMenu(player, this, {
            activePrompt: {
                menuTitle: 'Select a card to discard',
                buttons: buttons
            },
            source: this
        });
    }

    cardSelected(player, cardId) {
        var otherPlayer = this.game.getOtherPlayer(player);
        if(!otherPlayer) {
            return false;
        }

        var card = otherPlayer.findCardByUuid(otherPlayer.hand, cardId);
        if(!card) {
            return false;
        }

        otherPlayer.discardCard(card);

        this.game.addMessage('{0} uses {1} to discard {2} from {3}\'s hand', player, this, card, otherPlayer);

        return true;
    }

    cancel(player) {
        this.game.addMessage('{0} cancels the resolution of {1}', player, this);

        return true;
    }
}

SeenInFlames.code = '01064';

module.exports = SeenInFlames;
