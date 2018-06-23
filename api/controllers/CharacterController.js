/**
 * CharacterController.
 *
 * @description :: Server-side logic for managing Characters
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  async findOne(req, res) {
    let characterId = req.param('id');

    let character = await Character.findOne(characterId)
      .populate('system')
      .populate('ship')
      .populate('corporation')
      .populate('alliance');

    if (req.isSocket) {
      ActiveSockets.joinPool(req);
      Character.subscribe(req, [character.id]);
      System.subscribe(req, [character.system.id]);
      Constellation.subscribe(req, [character.system.constellation]);
      Region.subscribe(req, [character.system.region]);
    }

    return res.status(200).json(character);
  }

};
