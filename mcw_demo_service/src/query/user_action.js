/**
 * Created by racoon on 2017/3/12.
 */
import {select_data} from '../util/db_util'

export function select_from_g_user(req, res) {
    res.setHeader('Access-Control-Allow-Origin','*');
    var query = 'select gu.user_id as userId,gu.name as name,gu.gender as gender,gu.phone as phone,' +
        'gu.photo_url as photoUrl from g_user gu';
    select_data(query, {}, function (err, result) {
        res.send(200, res.json(result));
    })
};