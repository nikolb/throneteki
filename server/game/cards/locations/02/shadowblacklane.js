const _ = require('underscore');

const DrawCard = require('../../../drawcard.js');

class ShadowblackLane extends DrawCard {
    setupCardAbilities(ability) {
        this.reaction({
            when: {
                afterChallenge: (e, challenge) => challenge.winner === this.controller && challenge.challengeType === 'intrigue'
            },
            cost: ability.costs.kneelFactionCard(),
            handler: () => {
                var events = this.controller.searchDrawDeck(10, card => {
                    return card.getType() === 'event' && card.isFaction(this.controller.faction.getPrintedFaction());
                });

                var buttons = _.map(events, card => {
                    return { text: card.name, method: 'cardSelected', arg: card.uuid, card: card.getSummary(true) };
                });
                buttons.push({ text: 'Done', method: 'doneSelecting' });

                this.game.promptWithMenu(this.controller, this, {
                    activePrompt: {
                        menuTitle: 'Select a card to add to your hand',
                        buttons: buttons
                    },
                    source: this
                });
            }
        });
    }

    cardSelected(player, cardId) {
        var card = player.findCardByUuid(player.drawDeck, cardId);

        if(!card) {
            return false;
        }

        player.moveCard(card, 'hand');
        player.shuffleDrawDeck();
        this.game.addMessage('{0} uses {1} to reveal {2} and add it to their hand', player, this, card);

        return true;
    }

    doneSelecting(player) {
        player.shuffleDrawDeck();
        this.game.addMessage('{0} does not use {1} to add a card to their hand', player, this);

        return true;
    }
}

ShadowblackLane.code = '02038';

module.exports = ShadowblackLane;
