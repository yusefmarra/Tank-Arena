function validateName(string) {
  if (string.toUpperCase().trim().replace(/ /g, '').match(/[yÝýŸÿŶŷỲỳỴỵỶỷỸỹY].?[ÙùÚúÛûÜüŨũŪūŬŭŮůŰűŲųƯưǓǔǕǖǗǗǘǙǚǛǜỤụỦủỨứỪừỬửỮữUu].?[ŚśŜŝŞşŠšSs].?[èéêëeÈÉÊËÈèÉéÊêËëĒēĔĕĖėĘęĚěẸẹẺẻẼẽẾếỀềỂểỄễỆE].?[ƒFf]/)) {
    string = "He Who Must Not Be Named";
  }
  return string.trim().replace(/ /g, '');
}

function messageCensor(string) {
  return string.replace(/[yÝýŸÿŶŷỲỳỴỵỶỷỸỹY].?[ÙùÚúÛûÜüŨũŪūŬŭŮůŰűŲųƯưǓǔǕǖǗǗǘǙǚǛǜỤụỦủỨứỪừỬửỮữUu].?[ŚśŜŝŞşŠšSs].?[èéêëeÈÉÊËÈèÉéÊêËëĒēĔĕĖėĘęĚěẸẹẺẻẼẽẾếỀềỂểỄễỆE].?[ƒFf]/g, 'He Who Must Not Be Named');
}

module.exports = {
  'validateName': validateName,
  'messageCensor': messageCensor
}
