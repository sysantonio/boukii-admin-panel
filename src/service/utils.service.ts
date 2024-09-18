import { Injectable } from "@angular/core";
import moment from "moment";
import { MOCK_COUNTRIES } from "src/app/static-data/countries-data";

@Injectable({
  providedIn: "root",
})
export class UtilsService {
  private countries = MOCK_COUNTRIES;
  constructor() {}

  calculateYears(birthDateString: string) {
    const fechaActual = moment();
    const age = fechaActual.diff(
      moment(birthDateString, "YYYY-MM-DD"),
      "years"
    );
    return age;
  }

  getCountry(id: any) {
    const country = this.countries.find((c) => c.id == id);
    return country ? country.name : "NDF";
  }

  formatDate(date: string, format = "DD.MM.YYYY") {
    return moment(date).format(format);
  }

  getSchoolData() {
    const user = JSON.parse(localStorage.getItem("boukiiUser"));
    return user.schools[0]
  }
}
