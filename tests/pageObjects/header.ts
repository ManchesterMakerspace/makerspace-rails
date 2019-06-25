import utils from "./common";

class HeaderPageObject {
  private navMenuButton = "#menu-button"

  public loginLink = 'a[href="/login"]';
  
  public links = {
    members: "#members",
    profile: "#profile",
    billing: "#billing",
    settings: "#settings",
    logout: "#logout",
    rentals: "#rentals",
    earnedMemberships: '#earnedMembership',
  }
  public openNavMenu = () => utils.clickElement(this.navMenuButton);

  public navigateTo = async (menuLinkId: string) => {
    const element = menuLinkId === this.links.logout ? "li" : "a"; // TODO: these should be consistent
    const idSelector = `${element}${menuLinkId}`
    const displayed = await utils.isElementDisplayed(idSelector);
    if (!displayed) {
      await this.openNavMenu();
    }
    await utils.clickElement(idSelector);
  }
}

export default new HeaderPageObject();