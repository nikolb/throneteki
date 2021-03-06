/*global describe, it, beforeEach, expect, jasmine */
/*eslint camelcase: 0, no-invalid-this: 0 */

const BaseAbility = require('../../../server/game/baseability.js');

const AbilityResolver = require('../../../server/game/gamesteps/abilityresolver.js');

describe('BaseAbility', function () {
    beforeEach(function () {
        this.gameSpy = jasmine.createSpyObj('game', ['queueStep']);

        this.cardSpy = jasmine.createSpyObj('card', ['']);
        this.properties = {};
    });

    describe('constructor', function() {
        describe('cost', function() {
            describe('when no cost is passed', function() {
                beforeEach(function() {
                    delete this.properties.cost;
                    this.ability = new BaseAbility(this.gameSpy, this.cardSpy, this.properties);
                });

                it('should set cost to be empty array', function() {
                    expect(this.ability.cost).toEqual([]);
                });
            });

            describe('when a single cost is passed', function() {
                beforeEach(function() {
                    this.cost = { cost: 1 };
                    this.properties.cost = this.cost;
                    this.ability = new BaseAbility(this.gameSpy, this.cardSpy, this.properties);
                });

                it('should set cost to be an array with the cost', function() {
                    expect(this.ability.cost).toEqual([this.cost]);
                });
            });

            describe('when multiple costs are passed', function() {
                beforeEach(function() {
                    this.cost1 = { cost: 1 };
                    this.cost2 = { cost: 2 };
                    this.properties.cost = [this.cost1, this.cost2];
                    this.ability = new BaseAbility(this.gameSpy, this.cardSpy, this.properties);
                });

                it('should set cost to be the array', function() {
                    expect(this.ability.cost).toEqual([this.cost1, this.cost2]);
                });
            });
        });
    });

    describe('queueResolver()', function() {
        beforeEach(function() {
            this.context = { context: true };
            this.ability = new BaseAbility(this.gameSpy, this.cardSpy, this.properties);
            this.ability.queueResolver(this.context);
        });

        it('should queue an AbilityResolver step onto game', function() {
            expect(this.gameSpy.queueStep).toHaveBeenCalledWith(jasmine.any(AbilityResolver));
        });
    });

    describe('canPayCosts()', function() {
        beforeEach(function() {
            this.cost1 = jasmine.createSpyObj('cost1', ['canPay']);
            this.cost2 = jasmine.createSpyObj('cost1', ['canPay']);
            this.ability = new BaseAbility(this.gameSpy, this.cardSpy, this.properties);
            this.ability.cost = [this.cost1, this.cost2];
            this.context = { context: 1 };
        });

        describe('when all costs can be paid', function() {
            beforeEach(function() {
                this.cost1.canPay.and.returnValue(true);
                this.cost2.canPay.and.returnValue(true);
            });

            it('should call canPay with the context object', function() {
                this.ability.canPayCosts(this.context);
                expect(this.cost1.canPay).toHaveBeenCalledWith(this.context);
                expect(this.cost2.canPay).toHaveBeenCalledWith(this.context);
            });

            it('should return true', function() {
                expect(this.ability.canPayCosts(this.context)).toBe(true);
            });
        });

        describe('when any cost cannot be paid', function() {
            beforeEach(function() {
                this.cost1.canPay.and.returnValue(true);
                this.cost2.canPay.and.returnValue(false);
            });

            it('should return false', function() {
                expect(this.ability.canPayCosts(this.context)).toBe(false);
            });
        });
    });

    describe('resolveCosts()', function() {
        beforeEach(function() {
            this.noResolveCost = jasmine.createSpyObj('cost1', ['canPay']);
            this.resolveCost = jasmine.createSpyObj('cost2', ['canPay', 'resolve']);
            this.ability = new BaseAbility(this.gameSpy, this.cardSpy, this.properties);

            this.context = { context: 1 };
        });

        describe('when the cost does not have a resolve method', function() {
            beforeEach(function() {
                this.ability.cost = [this.noResolveCost];
                this.noResolveCost.canPay.and.returnValue('value1');

                this.results = this.ability.resolveCosts(this.context);
            });

            it('should call canPay on the cost', function() {
                expect(this.noResolveCost.canPay).toHaveBeenCalledWith(this.context);
            });

            it('should return the cost in resolved format', function() {
                expect(this.results).toEqual([{ resolved: true, value: 'value1' }]);
            });
        });

        describe('when the cost has a resolve method', function() {
            beforeEach(function() {
                this.ability.cost = [this.resolveCost];
                this.resolveCost.resolve.and.returnValue({ resolved: false });

                this.results = this.ability.resolveCosts(this.context);
            });

            it('should not call canPay on the cost', function() {
                expect(this.resolveCost.canPay).not.toHaveBeenCalled();
            });

            it('should call resolve on the cost', function() {
                expect(this.resolveCost.resolve).toHaveBeenCalledWith(this.context);
            });

            it('should return the result of resolve', function() {
                expect(this.results).toEqual([{ resolved: false }]);
            });
        });
    });

    describe('payCosts()', function() {
        beforeEach(function() {
            this.cost1 = jasmine.createSpyObj('cost1', ['pay']);
            this.cost2 = jasmine.createSpyObj('cost1', ['pay']);
            this.ability = new BaseAbility(this.gameSpy, this.cardSpy, this.properties);
            this.ability.cost = [this.cost1, this.cost2];
            this.context = { context: 1 };
        });

        it('should call pay with the context object', function() {
            this.ability.payCosts(this.context);
            expect(this.cost1.pay).toHaveBeenCalledWith(this.context);
            expect(this.cost2.pay).toHaveBeenCalledWith(this.context);
        });
    });
});
