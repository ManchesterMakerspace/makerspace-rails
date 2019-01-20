import utils from "./common";

class HeaderPageObject {
  private navMenuButton = "#menu-button"

  public links = {
    members: "#members",
    profile: "#profile",
    billing: "#billing",
    settings: "#settings",
    logout: "#logout",
    rentals: "#rentals",
  }
  public openNavMenu = () => utils.clickElement(this.navMenuButton);

  public navigateTo = async (menuLinkId: string) => {
    await this.openNavMenu();
    await utils.clickElement(menuLinkId);
  }
}

export default new HeaderPageObject();